
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";
import { formatDateTime } from "@/features/deposits/hooks/utils/dateUtils";
import { adaptDepositsForUI } from "@/features/deposits/utils/depositAdapters";

export const useFetchDeposits = (
  setDeposits: React.Dispatch<React.SetStateAction<Deposit[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const fetchDeposits = async () => {
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
      
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
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

      // Use our adapter to ensure all deposits have the required fields
      const formattedDeposits = adaptDepositsForUI(data);
      
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
  };

  return { fetchDeposits };
};
