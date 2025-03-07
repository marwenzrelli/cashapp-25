
import { useEffect, useCallback } from "react";
import { useFetchWithdrawals } from "./useFetchWithdrawals";
import { useDeleteWithdrawal } from "./useDeleteWithdrawal";
import { supabase } from "@/integrations/supabase/client";

export const useWithdrawals = () => {
  const { 
    withdrawals, 
    isLoading: fetchLoading, 
    error, 
    fetchWithdrawals 
  } = useFetchWithdrawals();

  const {
    withdrawalToDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    isLoading: deleteLoading
  } = useDeleteWithdrawal(fetchWithdrawals);

  // Memoize fetchWithdrawals to avoid infinite loops
  const fetchData = useCallback(async () => {
    try {
      // Check for active session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn("No active session found in useWithdrawals");
        return;
      } else {
        console.log("Active session found for user:", session.user.id);
      }
      
      await fetchWithdrawals();
    } catch (error) {
      console.error("Error refreshing withdrawals data:", error);
    }
  }, [fetchWithdrawals]);

  useEffect(() => {
    fetchData();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in withdrawals:", event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchData();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return {
    withdrawals,
    isLoading: fetchLoading || deleteLoading,
    error,
    fetchWithdrawals: fetchData,
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    withdrawalToDelete,
    showDeleteDialog,
    setShowDeleteDialog
  };
};
