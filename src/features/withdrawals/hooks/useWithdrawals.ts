
import { useEffect, useCallback, useState } from "react";
import { useFetchWithdrawals } from "./useFetchWithdrawals";
import { useDeleteWithdrawal } from "./useDeleteWithdrawal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useWithdrawals = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'reconnecting'>('online');
  const [authRetries, setAuthRetries] = useState(0);
  
  const { 
    withdrawals, 
    isLoading: fetchLoading, 
    error, 
    fetchWithdrawals,
    retries,
    lastError 
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
        setAuthRetries(prev => prev + 1);
        return false;
      }
      
      if (session) {
        console.log("Active session found for user:", session.user.id);
        setIsAuthenticated(true);
        setAuthRetries(0);
        return true;
      } else {
        console.warn("No active session found in useWithdrawals");
        setIsAuthenticated(false);
        setAuthRetries(prev => prev + 1);
        return false;
      }
    } catch (err) {
      console.error("Unexpected error checking auth:", err);
      setIsAuthenticated(false);
      setAuthRetries(prev => prev + 1);
      return false;
    } finally {
      setAuthChecking(false);
    }
  }, []);

  // Update network status based on retry count and window.navigator.onLine
  useEffect(() => {
    const updateNetworkStatus = () => {
      if (!navigator.onLine) {
        setNetworkStatus('offline');
      } else if (retries > 0 || (lastError && lastError.message.includes("Failed to fetch"))) {
        setNetworkStatus('reconnecting');
      } else {
        setNetworkStatus('online');
      }
    };

    updateNetworkStatus();
  }, [retries, lastError]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      toast.success("Connexion rétablie", { 
        description: "La connexion internet a été rétablie" 
      });
      fetchData();
    };
    
    const handleOffline = () => {
      setNetworkStatus('offline');
      toast.error("Connexion perdue", { 
        description: "Vérifiez votre connexion internet" 
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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
    if (authRetries < 3) {
      fetchData();
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in withdrawals:", event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
        fetchData();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        // We don't need to reset withdrawals here as the component will unmount
        // or the WithdrawalsPage will handle the authentication state
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData, authRetries]);

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
    setShowDeleteDialog,
    networkStatus,
    retrying: retries > 0 || authRetries > 0
  };
};
