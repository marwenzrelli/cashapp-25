
import { useState, useCallback } from "react";
import { Deposit } from "@/features/deposits/types";

export const useDepositState = () => {
  // Initialize with empty array instead of undefined to prevent unnecessary re-renders
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [depositToDelete, setDepositToDelete] = useState<Deposit | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Create stabilized setter functions to prevent unnecessary re-renders
  const stableSetDeposits = useCallback((newDeposits: Deposit[]) => {
    setDeposits(newDeposits);
  }, []);

  const stableSetIsLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const stableSetDepositToDelete = useCallback((deposit: Deposit | null) => {
    setDepositToDelete(deposit);
  }, []);

  const stableSetShowDeleteDialog = useCallback((show: boolean) => {
    setShowDeleteDialog(show);
  }, []);

  return {
    deposits,
    setDeposits: stableSetDeposits,
    isLoading,
    setIsLoading: stableSetIsLoading,
    depositToDelete,
    setDepositToDelete: stableSetDepositToDelete,
    showDeleteDialog,
    setShowDeleteDialog: stableSetShowDeleteDialog
  };
};
