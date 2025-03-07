
import { useState, useEffect, useCallback } from "react";
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
  const { fetchDeposits: fetchDepositsFunction } = useFetchDeposits(setDeposits, setIsLoading);
  const { createDeposit } = useCreateDeposit(fetchDepositsFunction, setIsLoading);
  const { updateDeposit } = useUpdateDeposit(fetchDepositsFunction, setIsLoading);
  const { deleteDeposit, confirmDeleteDeposit } = useDeleteDeposit(
    deposits, 
    setDeposits, 
    setIsLoading, 
    depositToDelete, 
    setDepositToDelete, 
    setShowDeleteDialog
  );

  const fetchDeposits = useCallback(async () => {
    console.log("Fetching deposits data from Supabase...");
    try {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        setIsLoading(true);
        await fetchDepositsFunction();
        console.log("Deposits fetched successfully");
      } else {
        console.error("Authentication failed when fetching deposits");
        toast.error("Veuillez vous connecter pour accéder aux versements");
      }
    } catch (error) {
      console.error("Error fetching deposits:", error);
      toast.error("Erreur lors du chargement des versements");
    } finally {
      setIsLoading(false);
    }
  }, [checkAuth, fetchDepositsFunction, setIsLoading]);

  // No auto-fetch on mount anymore - we'll fetch explicitly from the page component
  
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
