
import { useState } from "react";
import { Deposit } from "@/features/deposits/types";

export const useDepositState = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [depositToDelete, setDepositToDelete] = useState<Deposit | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return {
    deposits,
    setDeposits,
    isLoading,
    setIsLoading,
    depositToDelete,
    setDepositToDelete,
    showDeleteDialog,
    setShowDeleteDialog
  };
};
