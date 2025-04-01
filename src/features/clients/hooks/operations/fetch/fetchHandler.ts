
import { Client } from "../../../types";
import { supabase } from "@/integrations/supabase/client";
import { FETCH_TIMEOUT } from "./constants";

/**
 * Fetches clients data with a timeout
 */
export const fetchClientsData = async (): Promise<{
  data: Client[] | null;
  error: Error | null;
}> => {
  try {
    // Fetch clients with a timeout
    const fetchPromise = supabase
      .from('clients')
      .select('*')
      .order('date_creation', { ascending: false });
      
    // Manual timeout for the fetch operation
    const timeoutPromise = new Promise<{data: null, error: Error}>((resolve) => {
      setTimeout(() => {
        resolve({
          data: null,
          error: new Error("Délai d'attente dépassé pour la requête")
        });
      }, FETCH_TIMEOUT);
    });
    
    // Race between fetch and timeout
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Unknown error occurred")
    };
  }
};
