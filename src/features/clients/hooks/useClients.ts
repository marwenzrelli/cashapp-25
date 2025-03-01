import { useState, useEffect, useCallback, useRef } from "react";
import { Client } from "../types";
import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "sonner";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// Types pour les enregistrements de la base de données
type DepositRecord = {
  client_name: string;
  amount: number;
  created_at: string;
  id: number;
  notes?: string;
  status: string;
};

type WithdrawalRecord = {
  client_name: string;
  amount: number;
  created_at: string;
  id: string;
  notes?: string;
  status: string;
};

type TransferRecord = {
  from_client: string;
  to_client: string;
  amount: number;
  created_at: string;
  id: string;
  reason: string;
  status: string;
};

// Types spécifiques pour les payloads de changement
type DepositPayload = RealtimePostgresChangesPayload<DepositRecord>;
type WithdrawalPayload = RealtimePostgresChangesPayload<WithdrawalRecord>;
type TransferPayload = RealtimePostgresChangesPayload<TransferRecord>;

// Fonction utilitaire pour traiter les erreurs
const handleSupabaseError = (error: any) => {
  console.error("Erreur Supabase:", error);
  
  if (error.message?.includes("Failed to fetch")) {
    return "Problème de connexion réseau. Veuillez vérifier votre connexion internet.";
  }
  
  if (error.message?.includes("JWT")) {
    return "Session expirée. Veuillez vous reconnecter.";
  }
  
  return error.message || "Une erreur inattendue s'est produite";
};

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 3000; // 3 secondes
  
  // Utiliser une référence pour suivre si une notification d'erreur a déjà été affichée
  const errorNotifiedRef = useRef(false);
  // Utiliser une référence pour les opérations en cours
  const fetchingRef = useRef(false);

  // Fonction de récupération des clients
  const fetchClients = useCallback(async (retry = 0, showToast = true) => {
    // Si une récupération est déjà en cours, ne pas en démarrer une autre
    if (fetchingRef.current) {
      return;
    }
    
    fetchingRef.current = true;
    
    try {
      if (retry === 0) {
        setLoading(true);
        setError(null);
        // Réinitialiser le drapeau de notification d'erreur lors d'une nouvelle tentative
        errorNotifiedRef.current = false;
      }
      
      console.log(`Chargement des clients... (tentative ${retry + 1}/${MAX_RETRIES + 1})`);
      
      // Données de test pour simuler un succès en cas d'erreur persistante
      const mockData: Client[] = [];
      
      // Vérifier que la connexion à Supabase est établie
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Récupérer les clients avec un timeout de sécurité
      const fetchWithTimeout = async () => {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("La requête a expiré")), 10000);
        });
        
        const fetchPromise = supabase
          .from('clients')
          .select('*')
          .order('date_creation', { ascending: false });
        
        return Promise.race([fetchPromise, timeoutPromise]);
      };
      
      const { data: clientsData, error: clientsError } = await fetchWithTimeout() as any;

      if (clientsError) {
        console.error("Erreur lors de la récupération des clients:", clientsError);
        
        // Si nous n'avons pas atteint le nombre maximal de tentatives, réessayer
        if (retry < MAX_RETRIES) {
          console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
          setTimeout(() => fetchClients(retry + 1, false), RETRY_DELAY);
          return;
        }
        
        // Si toutes les tentatives ont échoué et que nous sommes en développement, utiliser des données de test
        if (process.env.NODE_ENV === 'development' && mockData.length > 0) {
          console.warn("Utilisation de données de test après échec de connexion");
          setClients(mockData);
          return;
        }
        
        // Sinon, lancer une erreur
        throw new Error(handleSupabaseError(clientsError));
      }

      if (!clientsData) {
        console.log("Aucune donnée reçue de la base de données");
        setClients([]);
        return;
      }

      console.log(`${clientsData.length} clients récupérés avec succès:`, clientsData);
      
      // Mettre à jour l'état avec les clients récupérés
      setClients(clientsData);
      
      // Pour éviter les problèmes de performance, limiter les appels à updateClientBalances
      if (clientsData.length > 0 && retry === 0) {
        setTimeout(() => {
          try {
            updateClientBalances(clientsData);
          } catch (balanceError) {
            console.error("Erreur lors de la mise à jour des soldes:", balanceError);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error("Erreur critique lors du chargement des clients:", error);
      
      if (retry < MAX_RETRIES) {
        console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
        setTimeout(() => fetchClients(retry + 1, false), RETRY_DELAY);
        return;
      }
      
      setError(handleSupabaseError(error));
      
      // Afficher la notification d'erreur seulement si nous n'en avons pas encore affiché et si showToast est true
      if (showToast && !errorNotifiedRef.current) {
        toast.error("Erreur de connexion", {
          description: handleSupabaseError(error),
          id: "client-fetch-error", // ID unique pour éviter les duplications
          duration: 5000, // Durée d'affichage de 5 secondes
        });
        errorNotifiedRef.current = true;
      }
    } finally {
      if (retry === 0 || retry === MAX_RETRIES) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, []);

  // Fonction pour mettre à jour les soldes des clients
  const updateClientBalances = async (clientsList: Client[]) => {
    if (!supabase || !clientsList.length) return;
    
    try {
      // Traiter les clients par lots pour éviter de surcharger l'API
      const batchSize = 3;
      
      for (let i = 0; i < clientsList.length; i += batchSize) {
        const batch = clientsList.slice(i, i + batchSize);
        
        for (const client of batch) {
          try {
            // Calculer le solde du client
            const { data: balance, error: balanceError } = await supabase
              .rpc('calculate_client_balance', { client_id: client.id });

            if (balanceError) {
              console.warn(`Impossible de calculer le solde pour ${client.prenom} ${client.nom}:`, balanceError);
              continue;
            }

            // Mettre à jour le solde dans la base de données
            const { error: updateError } = await supabase
              .from('clients')
              .update({ solde: balance || 0 })
              .eq('id', client.id);

            if (updateError) {
              console.warn(`Impossible de mettre à jour le solde pour ${client.prenom} ${client.nom}:`, updateError);
              continue;
            }

            // Mettre à jour le client dans l'état local
            setClients(prevClients => 
              prevClients.map(c => 
                c.id === client.id ? { ...c, solde: balance || 0 } : c
              )
            );
          } catch (error) {
            console.error(`Erreur pour le client ${client.id}:`, error);
          }
        }
        
        // Pause entre les lots pour éviter de surcharger l'API
        if (i + batchSize < clientsList.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des soldes:", error);
    }
  };

  // Fonction pour créer un nouveau client
  const createClient = async (newClient: Omit<Client, "id" | "date_creation">) => {
    try {
      setLoading(true);
      
      // Vérifier la connexion à Supabase
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Récupérer l'ID de l'utilisateur actuel ou utiliser un ID par défaut pour le développement
      let userId = "dev-user-id";
      
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn("Erreur de session:", sessionError);
        } else if (sessionData?.session?.user?.id) {
          userId = sessionData.session.user.id;
        }
      } catch (sessionError) {
        console.warn("Impossible de récupérer la session:", sessionError);
      }
      
      // Créer le client
      const { data, error } = await supabase
        .from('clients')
        .insert([{ 
          ...newClient, 
          created_by: userId,
          date_creation: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création du client:", error);
        toast.error("Erreur lors de la création", {
          description: handleSupabaseError(error)
        });
        return false;
      }

      // Ajouter le nouveau client à l'état local
      setClients(prevClients => [data, ...prevClients]);
      
      toast.success("Client créé avec succès", {
        description: `${newClient.prenom} ${newClient.nom} a été ajouté.`
      });
      
      return true;
    } catch (error) {
      console.error("Erreur critique lors de la création du client:", error);
      toast.error("Erreur lors de la création du client", {
        description: handleSupabaseError(error)
      });
      return false;
    } finally {
      setLoading(false);
      
      // Rafraîchir la liste complète en arrière-plan
      setTimeout(() => fetchClients(), 1000);
    }
  };

  // Fonction pour mettre à jour un client existant
  const updateClient = async (id: number, client: Partial<Client>) => {
    try {
      setLoading(true);
      
      // Vérifier la connexion à Supabase
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Mettre à jour le client
      const { error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id);

      if (error) {
        console.error("Erreur lors de la mise à jour du client:", error);
        toast.error("Erreur lors de la mise à jour", {
          description: handleSupabaseError(error)
        });
        return false;
      }

      // Mettre à jour le client dans l'état local
      setClients(prevClients => 
        prevClients.map(c => c.id === id ? { ...c, ...client } : c)
      );
      
      toast.success("Client mis à jour", {
        description: "Les informations ont été enregistrées avec succès."
      });
      
      return true;
    } catch (error) {
      console.error("Erreur critique lors de la mise à jour du client:", error);
      toast.error("Erreur lors de la mise à jour", {
        description: handleSupabaseError(error)
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un client
  const deleteClient = async (id: number) => {
    try {
      setLoading(true);
      
      // Vérifier la connexion à Supabase
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Récupérer les informations du client avant de le supprimer
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('prenom, nom')
        .eq('id', id)
        .single();

      if (clientError) {
        console.error("Erreur lors de la récupération du client:", clientError);
        toast.error("Client introuvable", {
          description: "Impossible de trouver les informations du client."
        });
        return false;
      }

      const clientFullName = `${clientData.prenom} ${clientData.nom}`;
      
      // Utiliser une transaction batch pour supprimer le client et ses données associées en une seule opération
      // Cette approche est plus rapide car elle envoie toutes les requêtes en parallèle
      const promises = [
        // Supprimer les dépôts
        supabase.from('deposits').delete().eq('client_name', clientFullName),
        
        // Supprimer les retraits
        supabase.from('withdrawals').delete().eq('client_name', clientFullName),
        
        // Supprimer les transferts (from)
        supabase.from('transfers').delete().eq('from_client', clientFullName),
        
        // Supprimer les transferts (to)
        supabase.from('transfers').delete().eq('to_client', clientFullName),
        
        // Supprimer les accès QR
        supabase.from('qr_access').delete().eq('client_id', id),
        
        // Supprimer le client (doit être exécuté en dernier après avoir attendu les autres opérations)
      ];
      
      // Exécuter toutes les opérations de suppression en parallèle
      const results = await Promise.all(promises);
      
      // Vérifier s'il y a des erreurs dans les opérations
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.warn("Certaines opérations de suppression ont échoué:", errors);
        // Continuer quand même car des données peuvent avoir été supprimées
      }
      
      // Finalement, supprimer le client lui-même
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
      
      // Mettre à jour l'état local
      setClients(prevClients => prevClients.filter(c => c.id !== id));
      
      toast.success("Client supprimé", {
        description: `${clientFullName} a été supprimé avec succès.`
      });
      
      return true;
    } catch (error) {
      console.error("Erreur critique lors de la suppression du client:", error);
      toast.error("Erreur lors de la suppression", {
        description: handleSupabaseError(error)
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir le solde d'un client
  const refreshClientBalance = async (id: number) => {
    try {
      // Vérifier la connexion à Supabase
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Calculer le solde du client
      const { data: balance, error: balanceError } = await supabase
        .rpc('calculate_client_balance', { client_id: id });

      if (balanceError) {
        console.error("Erreur lors du calcul du solde:", balanceError);
        return;
      }

      // Mettre à jour le solde dans la base de données
      await supabase
        .from('clients')
        .update({ solde: balance || 0 })
        .eq('id', id);

      // Mettre à jour le client dans l'état local
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === id ? { ...client, solde: balance || 0 } : client
        )
      );
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du solde:", error);
    }
  };

  // Configurer un écouteur de changements en temps réel unique et global pour éviter les multiples écouteurs
  useEffect(() => {
    // Charger les clients au démarrage
    fetchClients();

    // Configurer un seul écouteur pour tous les changements
    const setupRealtimeListener = async () => {
      try {
        // Créer un seul canal pour toutes les tables
        const channel = supabase
          .channel('table-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'clients' },
            (payload) => {
              console.log("Changement détecté dans la table clients:", payload);
              // Utiliser showToast=false pour éviter de montrer des toasts d'erreur répétés
              fetchClients(0, false);
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'deposits' },
            (payload) => {
              console.log("Changement détecté dans la table deposits:", payload);
              fetchClients(0, false);
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'withdrawals' },
            (payload) => {
              console.log("Changement détecté dans la table withdrawals:", payload);
              fetchClients(0, false);
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'transfers' },
            (payload) => {
              console.log("Changement détecté dans la table transfers:", payload);
              fetchClients(0, false);
            }
          )
          .subscribe((status) => {
            console.log("Statut de l'abonnement réel-time:", status);
          });

        // Nettoyer le canal au démontage du composant
        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Erreur lors de la configuration de l'écouteur en temps réel:", error);
      }
    };

    const cleanup = setupRealtimeListener();
    return () => {
      if (cleanup) {
        cleanup.then(cleanupFn => {
          if (cleanupFn) cleanupFn();
        });
      }
    };
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    refreshClientBalance
  };
};
