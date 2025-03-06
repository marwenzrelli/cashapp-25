
import { useState, useEffect, useCallback } from "react";
import { Client } from "@/features/clients/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useClientData = (clientId: number | null) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchClient = useCallback(async (id: number) => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching client data for ID: ${id} (${typeof id})`);
      
      // First, check if ID is valid
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID client invalide: ${id}`);
      }
      
      // Check if the client exists before trying to fetch it
      console.log("Checking if client exists...");
      const { count, error: countError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('id', id);
        
      if (countError) {
        console.error("Error checking if client exists:", countError);
        throw new Error(`Erreur lors de la vérification du client: ${countError.message}`);
      }
      
      if (count === 0) {
        console.error(`No client exists with ID ${id}`);
        throw new Error(`Le client avec l'identifiant ${id} n'existe pas dans notre système.`);
      }
      
      console.log(`Client with ID ${id} exists, count: ${count}`);
      
      // Now fetch the client data
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching client:", error);
        setError(`Erreur de récupération des données: ${error.message}`);
        toast.error("Erreur", {
          description: "Impossible de récupérer les données du client."
        });
        setClient(null);
      } else if (!data) {
        console.warn("No client found with ID:", id);
        setError(`Le client avec l'identifiant ${id} n'existe pas ou a été supprimé.`);
        setClient(null);
      } else {
        console.log("Client data retrieved:", data);
        setClient(data as Client);
        setError(null);
      }
    } catch (err: any) {
      console.error("Exception during client fetch:", err);
      setError(err.message || "Une erreur inattendue s'est produite");
      setClient(null);
      toast.error("Erreur de chargement", {
        description: err.message || "Une erreur inattendue s'est produite"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (clientId) {
      fetchClient(clientId);
    } else {
      setIsLoading(false);
      setError("ID client manquant");
    }
  }, [clientId, fetchClient]);
  
  return { client, isLoading, error, fetchClient };
};
