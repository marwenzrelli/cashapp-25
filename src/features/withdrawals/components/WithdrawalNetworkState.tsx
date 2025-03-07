
import React from "react";
import { NetworkErrorState } from "@/features/admin/components/administration/ErrorState";
import { Withdrawal } from "../types";
import { Client } from "@/features/clients/types";
import { WithdrawalOperations } from "./WithdrawalOperations";

interface WithdrawalNetworkStateProps {
  networkStatus: 'online' | 'offline' | 'reconnecting';
  isLoading: boolean;
  retrying: boolean;
  error: string | null;
  fetchWithdrawals: () => Promise<void>;
  withdrawals: Withdrawal[];
  filteredWithdrawals: Withdrawal[];
  paginatedWithdrawals: Withdrawal[];
  clients: Client[];
  fetchClients: () => Promise<void>;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
  deleteWithdrawal: (withdrawal: Withdrawal) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  confirmDeleteWithdrawal: () => Promise<boolean>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const WithdrawalNetworkState: React.FC<WithdrawalNetworkStateProps> = ({
  networkStatus,
  isLoading,
  retrying,
  error,
  fetchWithdrawals,
  withdrawals,
  filteredWithdrawals,
  paginatedWithdrawals,
  clients,
  fetchClients,
  refreshClientBalance,
  deleteWithdrawal,
  showDeleteDialog,
  setShowDeleteDialog,
  confirmDeleteWithdrawal,
  searchTerm,
  setSearchTerm,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage
}) => {
  if (networkStatus !== 'online' || error) {
    return (
      <NetworkErrorState
        status={networkStatus}
        error={error}
        onRetry={fetchWithdrawals}
        retrying={retrying}
      />
    );
  }

  // If online and no error, pass through to main operations component
  return (
    <WithdrawalOperations
      withdrawals={withdrawals}
      clients={clients}
      fetchWithdrawals={fetchWithdrawals}
      fetchClients={fetchClients}
      refreshClientBalance={refreshClientBalance}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      filteredWithdrawals={filteredWithdrawals}
      paginatedWithdrawals={paginatedWithdrawals}
      showDeleteDialog={showDeleteDialog}
      setShowDeleteDialog={setShowDeleteDialog}
      confirmDeleteWithdrawal={confirmDeleteWithdrawal}
    />
  );
};
