
import { useState, useEffect } from "react";
import { useFetchDeposits } from "./useFetchDeposits";
import { useDeleteDeposit } from "./deposit-hooks/useDeleteDeposit";
import { useCreateDeposit } from "./deposit-hooks/useCreateDeposit";
import { useUpdateDeposit } from "./deposit-hooks/useUpdateDeposit";
import { Deposit } from "../types";
import { useDepositState } from "./deposit-hooks/useDepositState";

export const useDeposits = () => {
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

  // Get the fetchDeposits function from useFetchDeposits
  const { fetchDeposits } = useFetchDeposits(setDeposits, setIsLoading);

  // Get the deleteDeposit and confirmDeleteDeposit functions
  const { deleteDeposit, confirmDeleteDeposit } = useDeleteDeposit(
    deposits,
    setDeposits,
    setIsLoading,
    depositToDelete,
    setDepositToDelete,
    setShowDeleteDialog
  );

  // Get the createDeposit function
  const { createDeposit } = useCreateDeposit(fetchDeposits, setIsLoading);

  // Get the updateDeposit function
  const { updateDeposit } = useUpdateDeposit(fetchDeposits, setIsLoading);

  // Fetch deposits on mount
  useEffect(() => {
    console.log("Fetching deposits from useDeposits hook");
    fetchDeposits();
  }, [fetchDeposits]);

  return { 
    deposits,
    isLoading,
    createDeposit,
    deleteDeposit,
    updateDeposit,
    confirmDeleteDeposit,
    setDepositToDelete,
    setShowDeleteDialog,
    fetchDeposits,
    refreshDeposits: fetchDeposits
  };
};
