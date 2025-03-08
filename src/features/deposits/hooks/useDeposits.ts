
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Deposit } from "@/features/deposits/types"; // Updated import path
import { useDepositState } from "./deposit-hooks/useDepositState";
import { useDepositAuth } from "./deposit-hooks/useDepositAuth";
import { useFetchDeposits } from "./deposit-hooks/useFetchDeposits";
import { useCreateDeposit } from "./deposit-hooks/useCreateDeposit";
import { useUpdateDeposit } from "./deposit-hooks/useUpdateDeposit";
import { useDeleteDeposit } from "./deposit-hooks/useDeleteDeposit";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      // Check for active session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn("No active session found, but will attempt to fetch deposits anyway");
        // Continue with fetch despite no session - this allows testing without auth
      } else {
        console.log("Active session found for user:", session.user.id);
      }
      
      setIsLoading(true);
      await fetchDepositsFunction();
      console.log("Deposits fetched successfully");
    } catch (error) {
      console.error("Error fetching deposits:", error);
      toast.error("Erreur lors du chargement des versements");
    } finally {
      setIsLoading(false);
    }
  }, [fetchDepositsFunction, setIsLoading]);
  
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
