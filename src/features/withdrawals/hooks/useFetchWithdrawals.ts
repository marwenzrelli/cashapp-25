
import { useState, useCallback } from "react";
import { Withdrawal } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDate } from "./utils/formatUtils";
import { handleSupabaseError, showErrorToast } from "@/features/clients/hooks/utils/errorUtils";

export const useFetchWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if the user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erreur de session:", sessionError);
        setError("Erreur d'authentification. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      
      const session = sessionData.session;
      
      if (!session) {
        console.warn("No active session found when fetching withdrawals");
        setLoading(false);
        setError("Authentication requise");
        setWithdrawals([]);
        return;
      }
      
      console.log("Fetching withdrawals with authenticated session:", session.user.id);
      
      const { data, error: fetchError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error("Erreur lors de la récupération des retraits:", fetchError);
        setError(handleSupabaseError(fetchError));
        setLoading(false);
        return;
      }

      if (!data) {
        console.log("Aucun retrait trouvé.");
        setWithdrawals([]);
        setLoading(false);
        return;
      }

      // Transform the data to match our Withdrawal type
      const transformedWithdrawals: Withdrawal[] = data.map(withdrawal => {
        const createdAtIso = withdrawal.created_at;
        const operationDateIso = withdrawal.operation_date;
        
        return {
          id: withdrawal.id.toString(), // Convert number to string for ID
          client_name: withdrawal.client_name,
          amount: withdrawal.amount,
          date: formatDate(createdAtIso), // Keep this for backward compatibility
          operation_date: operationDateIso, // Add the operation_date
          notes: withdrawal.notes || "",
          status: withdrawal.status,
        };
      });

      setWithdrawals(transformedWithdrawals);
      setLastError(null);
      // Reset retries on success
      setRetries(0);
    } catch (error) {
      const err = error as Error;
      setLastError(err);
      console.error("Erreur inattendue lors de la récupération des retraits:", error);
      
      // Handle network errors specifically
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError("Problème de connexion au serveur. Vérifiez votre connexion internet.");
        
        // Only show toast for first few retries to avoid spamming
        if (retries < 3) {
          toast.error("Problème de connexion", {
            description: "Tentative de reconnexion en cours...",
          });
        }
        
        // Increment retry count
        setRetries(prev => prev + 1);
        
        // Auto retry after delay (only for first 5 retries)
        if (retries < 5) {
          setTimeout(() => {
            fetchWithdrawals();
          }, 3000); // 3 second delay between retries
        }
      } else {
        setError("Erreur inattendue lors de la récupération des retraits.");
        toast.error("Erreur inattendue", {
          description: "Une erreur s'est produite lors de la récupération des retraits.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [retries]);

  return {
    withdrawals,
    isLoading: loading,
    error,
    fetchWithdrawals,
    retries,
    lastError
  };
};
