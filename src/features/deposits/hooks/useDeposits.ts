
import { useCallback, useEffect, useRef } from "react";
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

  // Use a ref to track if the initial fetch has been done
  const initialFetchDone = useRef(false);

  // Get the fetchDeposits function from useFetchDeposits
  const { fetchDeposits } = useFetchDeposits(setDeposits, setIsLoading);

  // Use useCallback to memoize the fetch function to prevent re-renders
  const memoizedFetchDeposits = useCallback(async () => {
    console.log("Fetching deposits from useDeposits hook");
    await fetchDeposits();
    initialFetchDone.current = true;
  }, [fetchDeposits]);

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
  const { createDeposit } = useCreateDeposit(memoizedFetchDeposits, setIsLoading);

  // Get the updateDeposit function
  const { updateDeposit } = useUpdateDeposit(memoizedFetchDeposits, setIsLoading);

  // Fetch deposits on initial mount only, and don't re-run on deps changes
  useEffect(() => {
    if (!initialFetchDone.current) {
      console.log("Initial fetch of deposits in useDeposits hook");
      memoizedFetchDeposits();
    }
  }, [memoizedFetchDeposits]);

  return { 
    deposits,
    isLoading,
    createDeposit,
    deleteDeposit,
    updateDeposit,
    confirmDeleteDeposit,
    setDepositToDelete,
    setShowDeleteDialog,
    showDeleteDialog,
    depositToDelete,
    fetchDeposits: memoizedFetchDeposits,
    refreshDeposits: memoizedFetchDeposits
  };
};
