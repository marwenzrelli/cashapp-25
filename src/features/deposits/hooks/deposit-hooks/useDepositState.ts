
import { useState, useCallback, useMemo } from "react";
import { Deposit } from "@/features/deposits/types";

export const useDepositState = () => {
  // Initialize with empty array instead of undefined to prevent unnecessary re-renders
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [depositToDelete, setDepositToDelete] = useState<Deposit | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Create stabilized setter functions to prevent unnecessary re-renders
  const stableSetDeposits = useCallback((newDeposits: Deposit[] | ((prev: Deposit[]) => Deposit[])) => {
    setDeposits(prevDeposits => {
      if (typeof newDeposits === 'function') {
        return newDeposits(prevDeposits);
      }
      
      // Only update if the data has actually changed
      if (JSON.stringify(prevDeposits) === JSON.stringify(newDeposits)) {
        return prevDeposits;
      }
      
      return newDeposits;
    });
  }, []);

  const stableSetIsLoading = useCallback((loading: boolean) => {
    setIsLoading(prev => {
      if (prev === loading) return prev;
      return loading;
    });
  }, []);

  const stableSetDepositToDelete = useCallback((deposit: Deposit | null) => {
    setDepositToDelete(prev => {
      if (prev === deposit) return prev;
      return deposit;
    });
  }, []);

  const stableSetShowDeleteDialog = useCallback((show: boolean) => {
    setShowDeleteDialog(prev => {
      if (prev === show) return prev;
      return show;
    });
  }, []);

  // Use memoized state object to prevent component re-renders when structure stays the same
  const stateObject = useMemo(() => ({
    deposits,
    setDeposits: stableSetDeposits,
    isLoading,
    setIsLoading: stableSetIsLoading,
    depositToDelete,
    setDepositToDelete: stableSetDepositToDelete,
    showDeleteDialog,
    setShowDeleteDialog: stableSetShowDeleteDialog
  }), [
    deposits, 
    stableSetDeposits, 
    isLoading, 
    stableSetIsLoading, 
    depositToDelete, 
    stableSetDepositToDelete,
    showDeleteDialog, 
    stableSetShowDeleteDialog
  ]);

  return stateObject;
};
