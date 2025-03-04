
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Deposit } from "@/components/deposits/types";
import { useDepositState } from "./deposit-hooks/useDepositState";
import { useDepositAuth } from "./deposit-hooks/useDepositAuth";
import { useFetchDeposits } from "./deposit-hooks/useFetchDeposits";
import { useCreateDeposit } from "./deposit-hooks/useCreateDeposit";
import { useUpdateDeposit } from "./deposit-hooks/useUpdateDeposit";
import { useDeleteDeposit } from "./deposit-hooks/useDeleteDeposit";
import { toast } from "sonner";

export const useDeposits = () => {
  const navigate = useNavigate();
  const { 
    deposits, 
    setDeposits, 
    isLoading, 
    setIsLoading, 
    depositToDelete, 
    setDepositToDelete, 
    showDeleteDialog, 
    setShowDeleteDialog 
  } = useDepositState();
  
  const { checkAuth } = useDepositAuth(navigate);
  const { fetchDeposits } = useFetchDeposits(setDeposits, setIsLoading);
  const { createDeposit } = useCreateDeposit(fetchDeposits, setIsLoading);
  const { updateDeposit } = useUpdateDeposit(fetchDeposits, setIsLoading);
  const { deleteDeposit, confirmDeleteDeposit } = useDeleteDeposit(
    deposits, 
    setDeposits, 
    setIsLoading, 
    depositToDelete, 
    setDepositToDelete, 
    setShowDeleteDialog
  );

  useEffect(() => {
    console.log("useDeposits - Initializing component");
    let isMounted = true;
    
    const init = async () => {
      try {
        console.log("useDeposits - Checking authentication");
        const isAuthenticated = await checkAuth();
        
        if (!isMounted) return;
        
        if (isAuthenticated) {
          console.log("useDeposits - User is authenticated, fetching deposits");
          await fetchDeposits();
        } else {
          console.log("useDeposits - User is not authenticated");
          toast.error("Veuillez vous connecter pour accéder à cette page");
          navigate('/login');
        }
      } catch (error: any) {
        console.error("useDeposits - Error during initialization:", error);
        if (isMounted) {
          toast.error("Erreur lors de l'initialisation", {
            description: error.message || "Veuillez rafraîchir la page"
          });
        }
      }
    };
    
    init();

    return () => {
      isMounted = false;
      console.log("useDeposits - Component unmounting");
    };
  }, []);

  return {
    deposits,
    isLoading,
    createDeposit,
    deleteDeposit,
    updateDeposit,
    fetchDeposits,
    depositToDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    setDepositToDelete,
    confirmDeleteDeposit
  };
};
