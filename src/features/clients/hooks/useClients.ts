
import { useState, useEffect } from "react";
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 secondes

  const fetchClients = async (retry = 0) => {
    try {
      setLoading(true);
      console.log(`Chargement des clients... (tentative ${retry + 1}/${MAX_RETRIES + 1})`);
      
      // Vérifier la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn("Erreur lors de la récupération de la session:", sessionError);
        // Continuer même sans session pour permettre la visualisation en mode déconnecté
      }
      
      if (!session && retry === 0) {
        // En première tentative, afficher un avertissement
        console.warn("Aucune session active. Accès limité aux clients.");
        // Ne pas retourner ici, permettre de continuer pour récupérer les clients publics
      }

      // Récupérer les clients même sans session (si l'API le permet)
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('date_creation', { ascending: false });

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        
        // Stratégie de retry
        if (retry < MAX_RETRIES) {
          console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
          setTimeout(() => fetchClients(retry + 1), RETRY_DELAY);
          return;
        } else {
          // Après plusieurs tentatives échouées, afficher un message d'erreur
          toast.error("Erreur lors du chargement des clients", {
            description: "Vérifiez votre connexion internet et réessayez."
          });
        }
        return;
      }

      if (!clientsData) {
        console.warn("Aucun client récupéré");
        setClients([]);
        return;
      }

      console.log("Clients récupérés:", clientsData);
      
      // Récupérer les clients sans calculer les soldes immédiatement
      setClients(clientsData);

      // Mettre à jour les soldes en arrière-plan pour chaque client
      updateClientBalances(clientsData);
      
    } catch (error) {
      console.error("Error in fetchClients:", error);
      
      // Stratégie de retry en cas d'erreur générale
      if (retry < MAX_RETRIES) {
        console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000} secondes...`);
        setTimeout(() => fetchClients(retry + 1), RETRY_DELAY);
      } else {
        toast.error("Une erreur est survenue lors du chargement des clients", {
          description: "Vérifiez votre connexion internet et réessayez."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour les soldes en arrière-plan
  const updateClientBalances = async (clientsList: Client[]) => {
    try {
      const updatedClients = await Promise.all(
        clientsList.map(async (client) => {
          try {
            const { data: balance, error: balanceError } = await supabase
              .rpc('calculate_client_balance', { client_id: client.id });

            if (balanceError) {
              console.error("Erreur calcul solde pour client", client.id, ":", balanceError);
              return client;
            }

            console.log(`Solde calculé pour ${client.prenom} ${client.nom}:`, balance);
            
            // Mise à jour du solde dans la base de données en arrière-plan
            try {
              const { error: updateError } = await supabase
                .from('clients')
                .update({ solde: balance || 0 })
                .eq('id', client.id);

              if (updateError) {
                console.error("Erreur mise à jour solde pour client", client.id, ":", updateError);
              }
            } catch (updateError) {
              console.error("Exception lors de la mise à jour du solde:", updateError);
            }

            return {
              ...client,
              solde: balance || 0
            };
          } catch (error) {
            console.error("Erreur lors du calcul du solde pour le client", client.id, ":", error);
            return client;
          }
        })
      );

      console.log("Clients avec soldes mis à jour:", updatedClients);
      setClients(updatedClients);
    } catch (error) {
      console.error("Erreur globale lors de la mise à jour des soldes:", error);
    }
  };

  const createClient = async (newClient: Omit<Client, "id" | "date_creation">) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté pour créer un client");
        return false;
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...newClient, created_by: session.user.id }])
        .select()
        .single();

      if (error) {
        console.error("Error creating client:", error);
        toast.error("Erreur lors de la création du client", {
          description: error.message
        });
        return false;
      }

      // Ajouter immédiatement le nouveau client à la liste locale
      setClients(prevClients => [data, ...prevClients]);
      
      // Rafraîchir la liste complète en arrière-plan
      fetchClients();
      return true;
    } catch (error) {
      console.error("Error in createClient:", error);
      toast.error("Une erreur est survenue lors de la création du client");
      return false;
    }
  };

  const updateClient = async (id: number, client: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id);

      if (error) {
        console.error("Error updating client:", error);
        toast.error("Erreur lors de la mise à jour du client", {
          description: error.message
        });
        return false;
      }

      // Mettre à jour le client localement pour une mise à jour immédiate de l'UI
      setClients(prevClients => 
        prevClients.map(c => c.id === id ? { ...c, ...client } : c)
      );
      
      // Rafraîchir la liste complète en arrière-plan
      fetchClients();
      return true;
    } catch (error) {
      console.error("Error in updateClient:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du client");
      return false;
    }
  };

  const deleteClient = async (id: number) => {
    try {
      setLoading(true);
      
      // Récupérer le client avant la suppression
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('prenom, nom')
        .eq('id', id)
        .single();

      if (clientError || !clientData) {
        console.error("Error fetching client:", clientError);
        toast.error("Client introuvable");
        return false;
      }

      const clientFullName = `${clientData.prenom} ${clientData.nom}`;
      console.log("Suppression du client:", clientFullName);

      // Commencer par les opérations avant de supprimer le client
      const deleteOperations = async () => {
        // Dépôts
        const { error: depositsError } = await supabase
          .from('deposits')
          .delete()
          .eq('client_name', clientFullName);

        if (depositsError) {
          throw new Error(`Erreur suppression dépôts: ${depositsError.message}`);
        }

        // Retraits
        const { error: withdrawalsError } = await supabase
          .from('withdrawals')
          .delete()
          .eq('client_name', clientFullName);

        if (withdrawalsError) {
          throw new Error(`Erreur suppression retraits: ${withdrawalsError.message}`);
        }

        // Transferts (from)
        const { error: transfersFromError } = await supabase
          .from('transfers')
          .delete()
          .eq('from_client', clientFullName);

        if (transfersFromError) {
          throw new Error(`Erreur suppression transferts (from): ${transfersFromError.message}`);
        }

        // Transferts (to)
        const { error: transfersToError } = await supabase
          .from('transfers')
          .delete()
          .eq('to_client', clientFullName);

        if (transfersToError) {
          throw new Error(`Erreur suppression transferts (to): ${transfersToError.message}`);
        }

        // QR Access
        const { error: qrError } = await supabase
          .from('qr_access')
          .delete()
          .eq('client_id', id);

        if (qrError) {
          throw new Error(`Erreur suppression QR: ${qrError.message}`);
        }
      };

      try {
        await deleteOperations();
        console.log("Toutes les opérations ont été supprimées");

        // Maintenant on peut supprimer le client
        const { error: deleteError } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);

        if (deleteError) {
          throw new Error(`Erreur suppression client: ${deleteError.message}`);
        }

        // Mise à jour de l'état local
        setClients(prevClients => prevClients.filter(c => c.id !== id));
        toast.success("Client supprimé avec succès");
        return true;

      } catch (operationError) {
        console.error("Erreur lors de la suppression des opérations:", operationError);
        toast.error(`Erreur: ${operationError.message}`);
        return false;
      }

    } catch (error) {
      console.error("Error in deleteClient:", error);
      toast.error("Une erreur est survenue lors de la suppression du client");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshClientBalance = async (id: number) => {
    try {
      console.log("Rafraîchissement du solde pour le client:", id);
      
      const { data: balance, error: balanceError } = await supabase
        .rpc('calculate_client_balance', { client_id: id });

      if (balanceError) {
        console.error("Erreur lors du calcul du solde:", balanceError);
        toast.error("Erreur lors de la mise à jour du solde");
        return;
      }

      console.log("Nouveau solde calculé:", balance);

      // Mise à jour immédiate du client dans le state local
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === id 
            ? { ...client, solde: balance || 0 }
            : client
        )
      );

      // Mise à jour du solde dans la base de données
      const { error: updateError } = await supabase
        .from('clients')
        .update({ solde: balance || 0 })
        .eq('id', id);

      if (updateError) {
        console.error("Erreur lors de la mise à jour du solde en base:", updateError);
        toast.error("Erreur lors de la mise à jour du solde");
        return;
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du solde:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du solde");
    }
  };

  useEffect(() => {
    fetchClients();

    const clientsChannel = supabase
      .channel('public:clients')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        async (payload) => {
          console.log("Changement détecté dans la table clients:", payload);
          await fetchClients();
        }
      )
      .subscribe();

    const depositsChannel = supabase
      .channel('public:deposits')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'deposits' },
        async (payload: DepositPayload) => {
          console.log("Changement détecté dans la table deposits:", payload);
          const newRecord = payload.new as DepositRecord | null;
          const oldRecord = payload.old as DepositRecord | null;

          if (newRecord?.client_name || oldRecord?.client_name) {
            const clientName = (newRecord?.client_name || oldRecord?.client_name)?.split(' ');
            if (clientName) {
              const client = clients.find(c => 
                c.prenom === clientName[0] && c.nom === clientName[1]
              );
              if (client) {
                await refreshClientBalance(client.id);
              }
            }
          }
        }
      )
      .subscribe();

    const withdrawalsChannel = supabase
      .channel('public:withdrawals')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'withdrawals' },
        async (payload: WithdrawalPayload) => {
          console.log("Changement détecté dans la table withdrawals:", payload);
          const newRecord = payload.new as WithdrawalRecord | null;
          const oldRecord = payload.old as WithdrawalRecord | null;

          if (newRecord?.client_name || oldRecord?.client_name) {
            const clientName = (newRecord?.client_name || oldRecord?.client_name)?.split(' ');
            if (clientName) {
              const client = clients.find(c => 
                c.prenom === clientName[0] && c.nom === clientName[1]
              );
              if (client) {
                await refreshClientBalance(client.id);
              }
            }
          }
        }
      )
      .subscribe();

    const transfersChannel = supabase
      .channel('public:transfers')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'transfers' },
        async (payload: TransferPayload) => {
          console.log("Changement détecté dans la table transfers:", payload);
          const newRecord = payload.new as TransferRecord | null;
          const oldRecord = payload.old as TransferRecord | null;

          // Traiter à la fois le client source et le client destination
          for (const record of [newRecord, oldRecord]) {
            if (!record) continue;

            if (record.from_client) {
              const fromClientName = record.from_client.split(' ');
              const fromClient = clients.find(c => 
                c.prenom === fromClientName[0] && c.nom === fromClientName[1]
              );
              if (fromClient) {
                await refreshClientBalance(fromClient.id);
              }
            }

            if (record.to_client) {
              const toClientName = record.to_client.split(' ');
              const toClient = clients.find(c => 
                c.prenom === toClientName[0] && c.nom === toClientName[1]
              );
              if (toClient) {
                await refreshClientBalance(toClient.id);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(depositsChannel);
      supabase.removeChannel(withdrawalsChannel);
      supabase.removeChannel(transfersChannel);
    };
  }, []);

  return {
    clients,
    loading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    refreshClientBalance
  };
};
