
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté pour accéder aux clients");
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('date_creation', { ascending: false });

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
    try {
      const { data: { session } } = await supabase.auth.getSession();
        
      if (!session) {
        toast.error("Vous devez être connecté pour supprimer un client");
        return false;
      }

      // D'abord, supprimer les accès QR associés
      const { error: qrDeleteError } = await supabase
        .from('qr_access')
        .delete()
        .eq('client_id', id);

      if (qrDeleteError) {
        console.error("Erreur lors de la suppression des accès QR:", qrDeleteError);
        toast.error("Erreur lors de la suppression des accès QR");
        return false;
      }

      // Ensuite, supprimer le client
      const { error: clientDeleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (clientDeleteError) {
        toast.error("Erreur lors de la suppression du client");
        console.error("Error deleting client:", clientDeleteError);
        return false;
      }

      await fetchClients();
      return true;
    } catch (error) {
      console.error("Error in deleteClient:", error);
      toast.error("Une erreur est survenue lors de la suppression");
      return false;
    }
  };

  const createClient = async (newClientData: Omit<Client, 'id' | 'date_creation' | 'status'>) => {
    const { data: { session } } = await supabase.auth.getSession();
      
    if (!session) {
      toast.error("Vous devez être connecté pour créer un client");
      return false;
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...newClientData,
        created_by: session.user.id
      })
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de la création du client");
      console.error("Error creating client:", error);
      return false;
    }

    if (data) {
      await fetchClients();
      return true;
    }

    return false;
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

    const clientsSubscription = supabase
      .channel('public_clients_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients'
      }, () => {
        console.log("Changement détecté dans la table clients");
        fetchClients();
      })
      .subscribe();

    return () => {
      clientsSubscription.unsubscribe();
    };
  }, []);

  return {
    clients,
    loading,
    fetchClients,
    updateClient,
    deleteClient,
    createClient,
    refreshClientBalance
  };
};
