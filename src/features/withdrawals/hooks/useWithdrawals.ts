
import { useEffect } from "react";
import { useFetchWithdrawals } from "./useFetchWithdrawals";
import { useDeleteWithdrawal } from "./useDeleteWithdrawal";

export const useWithdrawals = () => {
  const { 
    withdrawals, 
    isLoading: fetchLoading, 
    error, 
    fetchWithdrawals 
  } = useFetchWithdrawals();

  const {
    withdrawalToDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    isLoading: deleteLoading
  } = useDeleteWithdrawal(fetchWithdrawals);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return {
    withdrawals,
    isLoading: fetchLoading || deleteLoading,
    error,
    fetchWithdrawals,
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    withdrawalToDelete,
    showDeleteDialog,
    setShowDeleteDialog
  };
};
