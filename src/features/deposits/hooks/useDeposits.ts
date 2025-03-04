
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Deposit } from "@/components/deposits/types";
import { useDepositState } from "./deposit-hooks/useDepositState";
import { useDepositAuth } from "./deposit-hooks/useDepositAuth";
import { useFetchDeposits } from "./deposit-hooks/useFetchDeposits";
import { useCreateDeposit } from "./deposit-hooks/useCreateDeposit";
import { useUpdateDeposit } from "./deposit-hooks/useUpdateDeposit";
import { useDeleteDeposit } from "./deposit-hooks/useDeleteDeposit";

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
    const init = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await fetchDeposits();
      }
    };
    init();
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
