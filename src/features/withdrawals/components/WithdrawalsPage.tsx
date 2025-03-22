
import React from "react";
import { useWithdrawals } from "../hooks/useWithdrawals";
import { useClients } from "@/features/clients/hooks/useClients";
import { WithdrawalsContent } from "./WithdrawalsContent";
import { useWithdrawalPagination } from "../hooks/useWithdrawalPagination";

export const WithdrawalsPage = () => {
  // Fetch withdrawals data
  const {
    withdrawals,
    fetchWithdrawals,
    deleteWithdrawal,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteWithdrawal
  } = useWithdrawals();

  // Fetch clients data
  const { clients, fetchClients, refreshClientBalance } = useClients();

  // Setup pagination and filtering
  const {
    searchTerm,
    setSearchTerm,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    dateRange,
    setDateRange,
    paginatedWithdrawals
  } = useWithdrawalPagination(withdrawals);

  React.useEffect(() => {
    fetchWithdrawals();
    fetchClients();
  }, [fetchWithdrawals, fetchClients]);

  return (
    <WithdrawalsContent
      withdrawals={withdrawals}
      paginatedWithdrawals={paginatedWithdrawals}
      clients={clients}
      fetchWithdrawals={fetchWithdrawals}
      fetchClients={fetchClients}
      refreshClientBalance={refreshClientBalance}
      deleteWithdrawal={deleteWithdrawal}
      showDeleteDialog={showDeleteDialog}
      setShowDeleteDialog={setShowDeleteDialog}
      confirmDeleteWithdrawal={confirmDeleteWithdrawal}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      dateRange={dateRange}
      setDateRange={setDateRange}
    />
  );
};
