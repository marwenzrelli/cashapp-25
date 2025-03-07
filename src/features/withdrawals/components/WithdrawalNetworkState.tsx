
import React from "react";
import { NetworkStatusAlerts } from "./NetworkStatusAlerts";
import { ErrorRetryButton } from "./ErrorRetryButton";
import { WithdrawalsContent } from "./WithdrawalsContent";
import { Client } from "@/features/clients/types";
import { Withdrawal } from "../types";

interface WithdrawalNetworkStateProps {
  networkStatus: 'online' | 'offline' | 'reconnecting';
  isLoading: boolean;
  retrying: boolean;
  error: string | null;
  fetchWithdrawals: () => void;
  withdrawals: Withdrawal[];
  filteredWithdrawals: Withdrawal[];
  paginatedWithdrawals: Withdrawal[];
  clients: Client[];
  fetchClients: () => void;
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
  if (networkStatus === 'offline' || networkStatus === 'reconnecting' || error) {
    return (
      <>
        <NetworkStatusAlerts 
          networkStatus={networkStatus}
          isLoading={isLoading}
          retrying={retrying}
          error={error}
          fetchWithdrawals={fetchWithdrawals}
        />
        
        {error && (
          <ErrorRetryButton 
            onRetry={fetchWithdrawals}
            isLoading={isLoading}
            retrying={retrying}
          />
        )}
        
        {!isLoading && withdrawals.length > 0 && (
          <WithdrawalsContent
            withdrawals={filteredWithdrawals}
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
          />
        )}
      </>
    );
  }

  return null;
};
