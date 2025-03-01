
import { useState, useEffect } from "react";
import { useClients } from "@/features/clients/hooks/useClients";
import { useWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { useClientSubscription } from "@/features/withdrawals/components/useClientSubscription";
import { WithdrawalsContent } from "@/features/withdrawals/components/WithdrawalsContent";

const Withdrawals = () => {
  const { 
    withdrawals, 
    isLoading,
    fetchWithdrawals, 
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    showDeleteDialog,
    setShowDeleteDialog
  } = useWithdrawals();

  const { clients, fetchClients, refreshClientBalance } = useClients();

  useEffect(() => {
    fetchClients();
    fetchWithdrawals();
  }, []);

  useClientSubscription({ fetchClients });

  return (
    <WithdrawalsContent
      withdrawals={withdrawals}
      clients={clients}
      fetchWithdrawals={fetchWithdrawals}
      fetchClients={fetchClients}
      refreshClientBalance={refreshClientBalance}
      deleteWithdrawal={deleteWithdrawal}
      showDeleteDialog={showDeleteDialog}
      setShowDeleteDialog={setShowDeleteDialog}
      confirmDeleteWithdrawal={confirmDeleteWithdrawal}
    />
  );
};

export default Withdrawals;
