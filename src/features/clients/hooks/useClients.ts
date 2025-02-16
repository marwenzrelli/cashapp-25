
import { useState } from "react";
import { Client } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('date_creation', { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des clients");
      console.error("Error fetching clients:", error);
      return;
    }

    if (data) {
      setClients(data);
    }
  };

  const updateClient = async (id: number, updates: Partial<Client>) => {
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

  const createClient = async (newClientData: Omit<Client, 'id' | 'date_creation' | 'status'>) => {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...newClientData,
        created_by: (await supabase.auth.getUser()).data.user?.id
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

  return {
    clients,
    fetchClients,
    updateClient,
    deleteClient,
    createClient
  };
};
