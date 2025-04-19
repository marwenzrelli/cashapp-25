
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";
import { formatDateTime } from "@/features/deposits/hooks/utils/dateUtils";
import { useCallback } from "react";

export const useFetchDeposits = (
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const fetchDeposits = useCallback(async () => {
    try {
      console.log("Starting to fetch deposits from Supabase...");
      setIsLoading(true);
      
      // First check if the user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      
      if (!session) {
        console.warn("No active session found when fetching deposits");
        // We continue anyway for now as RLS might be disabled during testing
      } else {
        console.log("Fetching deposits with authenticated session:", session.user.id);
      }
      
      // Get deposits data with client_id and client balance included through a join
      const { data, error } = await supabase
        .from('deposits')
        .select('*, clients(solde)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching deposits:", error);
        toast.error("Erreur lors du chargement des versements", {
          description: error.message
        });
        setDeposits([]);
        return;
      }

      // Log the raw data for debugging
      console.log("Raw deposits data from Supabase:", data);

      if (!data || data.length === 0) {
        console.log("No deposits found in the database");
        setDeposits([]);
        return;
      }

      console.log(`Retrieved ${data.length} deposits from Supabase`);

      const formattedDeposits: Deposit[] = data.map(d => {
        // Always use operation_date for the main display date if available
        const displayDate = d.operation_date ? formatDateTime(d.operation_date) : formatDateTime(d.created_at);
        
        return {
          id: d.id,
          amount: Number(d.amount),
          date: displayDate,
          description: d.notes || '',
          client_name: d.client_name,
          client_id: d.client_id,
          client_balance: d.clients?.solde || null,
          status: d.status,
          created_at: d.created_at,
          created_by: d.created_by || null,
          operation_date: d.operation_date,
          last_modified_at: d.last_modified_at
        };
      });

      console.log("Deposits loaded and formatted:", formattedDeposits);
      setDeposits(formattedDeposits);
    } catch (error) {
      console.error("Error loading deposits:", error);
      toast.error("Erreur lors du chargement des versements");
      // Set empty array to avoid undefined issues
      setDeposits([]);
    } finally {
      setIsLoading(false);
    }
  }, [setDeposits, setIsLoading]);

  return { fetchDeposits };
};
