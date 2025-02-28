
import { useState, useEffect, useCallback } from "react";
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

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 secondes

  // Utiliser useCallback pour créer la fonction de récupération des clients de manière memoïsée
  const fetchClients = useCallback(async (retry = 0) => {
    try {
      if (retry === 0) {
        setLoading(true);
        setError(null);
      }
      
      console.log(`Chargement des clients... (tentative ${retry + 1}/${MAX_RETRIES + 1})`);
      
      // Vérifier que la connexion à Supabase est établie
      if (!supabase) {
        throw new Error("La connexion à la base de données n'est pas disponible");
      }
      
      // Récupérer les clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('date_creation', { ascending: false });

      if (clientsError) {
        console.error("Erreur lors de la récupération des clients:", clientsError);
        
        // Si nous n'avons pas atteint le nombre maximal de tentatives, réessayer
        if (retry < MAX_RETRIES) {
          console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
          setTimeout(() => fetchClients(retry + 1), RETRY_DELAY);
          return;
        }
        
        // Si toutes les tentatives ont échoué, définir l'erreur et afficher un toast
        throw new Error(clientsError.message || "Erreur lors du chargement des clients");
      }

      if (!clientsData || clientsData.length === 0) {
        console.log("Aucun client trouvé dans la base de données");
        setClients([]);
        return;
      }

      console.log(`${clientsData.length} clients récupérés avec succès`);
      
      // Mettre à jour l'état avec les clients récupérés
      setClients(clientsData);
      
      // Calculer les soldes en arrière-plan
      try {
        updateClientBalances(clientsData);
      } catch (balanceError) {
        console.error("Erreur lors de la mise à jour des soldes:", balanceError);
        // Ne pas bloquer le chargement des clients si le calcul des soldes échoue
      }
      
    } catch (error) {
      console.error("Erreur critique lors du chargement des clients:", error);
      
      if (retry < MAX_RETRIES) {
        console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
        setTimeout(() => fetchClients(retry + 1), RETRY_DELAY);
        return;
      }
      
      setError((error as Error).message || "Une erreur est survenue");
      toast.error("Erreur de connexion", {
        description: "Impossible de charger les clients. Vérifiez votre connexion et réessayez."
      });
    } finally {
      if (retry === 0 || retry === MAX_RETRIES) {
        setLoading(false);
      }
    }
  }, []);

  // Fonction pour mettre à jour les soldes des clients
  const updateClientBalances = async (clientsList: Client[]) => {
    if (!supabase || !clientsList.length) return;
    
    try {
      // Traiter les clients par lots pour éviter de surcharger l'API
      const batchSize = 5;
      for (let i = 0; i < clientsList.length; i += batchSize) {
        const batch = clientsList.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (client) => {
            try {
              // Calculer le solde du client
              const { data: balance, error: balanceError } = await supabase
                .rpc('calculate_client_balance', { client_id: client.id });

              if (balanceError) {
                console.warn(`Impossible de calculer le solde pour ${client.prenom} ${client.nom}:`, balanceError);
                return;
              }

              // Mettre à jour le solde dans la base de données
              const { error: updateError } = await supabase
                .from('clients')
                .update({ solde: balance || 0 })
                .eq('id', client.id);

              if (updateError) {
                console.warn(`Impossible de mettre à jour le solde pour ${client.prenom} ${client.nom}:`, updateError);
                return;
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
          })
        );
        
        // Pause entre les lots pour éviter de surcharger l'API
        if (i + batchSize < clientsList.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
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
      
      // Vérifier si l'utilisateur est connecté
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Erreur de session: ${sessionError.message}`);
      }
      
      if (!sessionData.session) {
        toast.error("Session expirée", {
          description: "Veuillez vous reconnecter pour effectuer cette action."
        });
        return false;
      }
      
      // Créer le client
      const { data, error } = await supabase
        .from('clients')
        .insert([{ 
          ...newClient, 
          created_by: sessionData.session.user.id,
          date_creation: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création du client:", error);
        toast.error("Erreur lors de la création", {
          description: error.message || "Impossible de créer le client."
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
        description: (error as Error).message || "Une erreur est survenue."
      });
      return false;
    } finally {
      setLoading(false);
      
      // Rafraîchir la liste complète en arrière-plan
      fetchClients();
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
          description: error.message || "Impossible de mettre à jour le client."
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
        description: (error as Error).message || "Une erreur est survenue."
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
      
      // Supprimer le client et ses opérations associées
      try {
        // Supprimer les dépôts
        await supabase
          .from('deposits')
          .delete()
          .eq('client_name', clientFullName);
        
        // Supprimer les retraits
        await supabase
          .from('withdrawals')
          .delete()
          .eq('client_name', clientFullName);
        
        // Supprimer les transferts (from)
        await supabase
          .from('transfers')
          .delete()
          .eq('from_client', clientFullName);
        
        // Supprimer les transferts (to)
        await supabase
          .from('transfers')
          .delete()
          .eq('to_client', clientFullName);
        
        // Supprimer les accès QR
        await supabase
          .from('qr_access')
          .delete()
          .eq('client_id', id);
        
        // Supprimer le client
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
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression", {
          description: (error as Error).message || "Impossible de supprimer le client."
        });
        return false;
      }
    } catch (error) {
      console.error("Erreur critique lors de la suppression du client:", error);
      toast.error("Erreur lors de la suppression", {
        description: (error as Error).message || "Une erreur est survenue."
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

  // Configurer les écouteurs de changements en temps réel et charger les clients au montage du composant
  useEffect(() => {
    // Charger les clients au démarrage
    fetchClients();

    // Configurer les écouteurs pour les changements en temps réel
    const setupRealtimeListeners = async () => {
      try {
        // Écouteur pour les changements dans la table clients
        const clientsChannel = supabase
          .channel('client-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'clients' },
            (payload) => {
              console.log("Changement détecté dans la table clients:", payload);
              // Recharger tous les clients pour être sûr d'avoir les données les plus récentes
              fetchClients();
            }
          )
          .subscribe((status) => {
            console.log("Statut de l'abonnement clients:", status);
          });

        // Écouteur pour les changements dans la table deposits
        const depositsChannel = supabase
          .channel('deposit-changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'deposits' },
            (payload) => {
              console.log("Changement détecté dans la table deposits:", payload);
              fetchClients(); // Recharger tous les clients pour mettre à jour les soldes
            }
          )
          .subscribe();

        // Écouteur pour les changements dans la table withdrawals
        const withdrawalsChannel = supabase
          .channel('withdrawal-changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'withdrawals' },
            (payload) => {
              console.log("Changement détecté dans la table withdrawals:", payload);
              fetchClients(); // Recharger tous les clients pour mettre à jour les soldes
            }
          )
          .subscribe();

        // Écouteur pour les changements dans la table transfers
        const transfersChannel = supabase
          .channel('transfer-changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'transfers' },
            (payload) => {
              console.log("Changement détecté dans la table transfers:", payload);
              fetchClients(); // Recharger tous les clients pour mettre à jour les soldes
            }
          )
          .subscribe();

        // Nettoyer les écouteurs au démontage du composant
        return () => {
          supabase.removeChannel(clientsChannel);
          supabase.removeChannel(depositsChannel);
          supabase.removeChannel(withdrawalsChannel);
          supabase.removeChannel(transfersChannel);
        };
      } catch (error) {
        console.error("Erreur lors de la configuration des écouteurs en temps réel:", error);
      }
    };

    const cleanup = setupRealtimeListeners();
    return () => {
      // Nettoyer les écouteurs au démontage du composant
      cleanup.then(cleanupFn => {
        if (cleanupFn) cleanupFn();
      });
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
