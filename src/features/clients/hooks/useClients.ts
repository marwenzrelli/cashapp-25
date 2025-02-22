
import { useState, useEffect } from "react";
import { Client } from "../types";
import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "sonner";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log("Chargement des clients...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté pour accéder aux clients");
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('date_creation', { ascending: false });

      console.log("Clients actuels:", data);

      if (error) {
        console.error("Error fetching clients:", error);
        toast.error("Erreur lors du chargement des clients");
        return;
      }

      if (data) {
        setClients(data);
      }
    } catch (error) {
      console.error("Error in fetchClients:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (newClient: Omit<Client, 'id' | 'date_creation' | 'status'>) => {
    const { data: { session } } = await supabase.auth.getSession();
      
    if (!session) {
      toast.error("Vous devez être connecté pour créer un client");
      return false;
    }

    const { error } = await supabase
      .from('clients')
      .insert([{ ...newClient, created_by: session.user.id }]);

    if (error) {
      toast.error("Erreur lors de la création du client");
      console.error("Error creating client:", error);
      return false;
    }

    await fetchClients();
    return true;
  };

  const updateClient = async (id: number, updates: Partial<Client>) => {
    const { data: { session } } = await supabase.auth.getSession();
      
    if (!session) {
      toast.error("Vous devez être connecté pour modifier un client");
      return false;
    }

    const { error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la modification du client");
      console.error("Error updating client:", error);
      return false;
    }

    await fetchClients();
    return true;
  };

  const deleteClient = async (id: number) => {
    const { data: { session } } = await supabase.auth.getSession();
      
    if (!session) {
      toast.error("Vous devez être connecté pour supprimer un client");
      return false;
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression du client");
      console.error("Error deleting client:", error);
      return false;
    }

    await fetchClients();
    return true;
  };

  const refreshClientBalance = async (id: number) => {
    try {
      console.log("Rafraîchissement du solde pour le client:", id);
      
      const { data, error } = await supabase
        .rpc('calculate_client_balance', { client_id: id });

      if (error) {
        console.error("Erreur lors du calcul du solde:", error);
        toast.error("Erreur lors de la mise à jour du solde");
        return;
      }

      if (data !== null) {
        console.log("Nouveau solde calculé:", data);
        await updateClient(id, { solde: data });
      }

      await fetchClients();
      
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
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        (payload) => {
          console.log("Changement détecté dans la table clients:", payload);
          fetchClients();
        }
      )
      .subscribe();

    const depositsChannel = supabase
      .channel('public:deposits')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposits'
        },
        async (payload: any) => {
          console.log("Changement détecté dans la table deposits:", payload);
          if (payload.new && payload.new.client_name) {
            const clientName = payload.new.client_name.split(' ');
            const client = clients.find(c => 
              c.prenom === clientName[0] && c.nom === clientName[1]
            );
            if (client) {
              await refreshClientBalance(client.id);
            }
          }
        }
      )
      .subscribe();

    const withdrawalsChannel = supabase
      .channel('public:withdrawals')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawals'
        },
        async (payload: any) => {
          console.log("Changement détecté dans la table withdrawals:", payload);
          if (payload.new && payload.new.client_name) {
            const clientName = payload.new.client_name.split(' ');
            const client = clients.find(c => 
              c.prenom === clientName[0] && c.nom === clientName[1]
            );
            if (client) {
              await refreshClientBalance(client.id);
            }
          }
        }
      )
      .subscribe();

    const transfersChannel = supabase
      .channel('public:transfers')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transfers'
        },
        async (payload: any) => {
          console.log("Changement détecté dans la table transfers:", payload);
          fetchClients();
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
