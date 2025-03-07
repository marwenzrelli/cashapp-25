
import { useEffect, useCallback, useState } from "react";
import { useFetchWithdrawals } from "./useFetchWithdrawals";
import { useDeleteWithdrawal } from "./useDeleteWithdrawal";
import { supabase } from "@/integrations/supabase/client";

export const useWithdrawals = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  
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

  // Check authentication status
  const checkAuth = useCallback(async () => {
    setAuthChecking(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error checking auth session:", sessionError);
        setIsAuthenticated(false);
        return false;
      }
      
      if (session) {
        console.log("Active session found for user:", session.user.id);
        setIsAuthenticated(true);
        return true;
      } else {
        console.warn("No active session found in useWithdrawals");
        setIsAuthenticated(false);
        return false;
      }
    } catch (err) {
      console.error("Unexpected error checking auth:", err);
      setIsAuthenticated(false);
      return false;
    } finally {
      setAuthChecking(false);
    }
  }, []);

  // Memoize fetchWithdrawals to avoid infinite loops
  const fetchData = useCallback(async () => {
    try {
      const isAuthed = await checkAuth();
      
      if (!isAuthed) {
        console.warn("Not authenticated, skipping data fetch");
        return;
      }
      
      await fetchWithdrawals();
    } catch (error) {
      console.error("Error refreshing withdrawals data:", error);
    }
  }, [fetchWithdrawals, checkAuth]);

  useEffect(() => {
    fetchData();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in withdrawals:", event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
        fetchData();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData]);

  return {
    withdrawals,
    isLoading: fetchLoading || deleteLoading || authChecking,
    authChecking,
    isAuthenticated,
    error,
    fetchWithdrawals: fetchData,
    checkAuth,
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    withdrawalToDelete,
    showDeleteDialog,
    setShowDeleteDialog
  };
};
