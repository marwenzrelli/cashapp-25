
import { useState, useEffect, useCallback } from "react";
import { useWithdrawals } from "./useWithdrawals";
import { useClients } from "@/features/clients/hooks/useClients";
import { toast } from "sonner";

export const useWithdrawalsAuth = () => {
  const [retryingAuth, setRetryingAuth] = useState(false);
  
  const { 
    isAuthenticated,
    authChecking,
    checkAuth,
    fetchWithdrawals,
    networkStatus,
    error
  } = useWithdrawals();

  const { fetchClients } = useClients();

  const handleAuthRetry = async () => {
    setRetryingAuth(true);
    try {
      await checkAuth();
      if (isAuthenticated) {
        await fetchClients();
        await fetchWithdrawals();
      }
    } catch (error) {
      console.error("Error during auth retry:", error);
      toast.error("Erreur lors de l'authentification", {
        description: "Veuillez vous reconnecter"
      });
    } finally {
      setRetryingAuth(false);
    }
  };

  return {
    isAuthenticated,
    authChecking,
    handleAuthRetry,
    retryingAuth,
    networkStatus,
    error,
    fetchWithdrawals
  };
};
