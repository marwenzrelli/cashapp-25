
import React from "react";
import { useWithdrawals } from "../hooks/useWithdrawals";
import { useClients } from "@/features/clients/hooks/useClients";
import { useWithdrawalPagination } from "../hooks/useWithdrawalPagination";
import { Operation } from "@/features/operations/types";
import { ClientSubscriptionHandler } from "./ClientSubscriptionHandler";
import { WithdrawalAuthState } from "./WithdrawalAuthState";
import { WithdrawalNetworkState } from "./WithdrawalNetworkState";
import { WithdrawalLoadingState } from "./WithdrawalLoadingState";
import { WithdrawalOperations } from "./WithdrawalOperations";
import { useWithdrawalsAuth } from "../hooks/useWithdrawalsAuth";

interface WithdrawalsPageProps {
  onEditWithdrawal?: (operation: Operation) => void;
  onDeleteWithdrawal?: (operation: Operation) => void;
}

export const WithdrawalsPage: React.FC<WithdrawalsPageProps> = ({ 
  onEditWithdrawal, 
  onDeleteWithdrawal 
}) => {
  // Helper function for refreshClientBalance that adapts the types
  const handleRefreshClientBalance = async (clientId: string): Promise<boolean> => {
    try {
      await refreshClientBalance(parseInt(clientId, 10));
      return true;
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      return false;
    }
  };
  
  const { 
    withdrawals, 
    isLoading,
    error,
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    showDeleteDialog,
    setShowDeleteDialog,
    networkStatus,
    retrying
  } = useWithdrawals();

  const {
    isAuthenticated,
    authChecking,
    handleAuthRetry,
    retryingAuth
  } = useWithdrawalsAuth();

  const { clients, fetchClients, refreshClientBalance } = useClients();

  const {
    searchTerm,
    setSearchTerm,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    filteredWithdrawals,
    paginatedWithdrawals
  } = useWithdrawalPagination(withdrawals);

  // Auth state component
  const authStateComponent = (
    <WithdrawalAuthState 
      authChecking={authChecking}
      isAuthenticated={isAuthenticated}
      retryingAuth={retryingAuth}
      onRetry={handleAuthRetry}
    />
  );

  if (authStateComponent.props.isAuthenticated === false || authStateComponent.props.authChecking) {
    return authStateComponent;
  }

  // Client subscription handler (no visible UI)
  const clientSubscription = (
    <ClientSubscriptionHandler isAuthenticated={isAuthenticated} />
  );

  // Network state component
  const networkStateComponent = (
    <WithdrawalNetworkState
      networkStatus={networkStatus}
      isLoading={isLoading}
      retrying={retrying}
      error={error}
      fetchWithdrawals={useWithdrawals().fetchWithdrawals}
      withdrawals={withdrawals}
      filteredWithdrawals={filteredWithdrawals}
      paginatedWithdrawals={paginatedWithdrawals}
      clients={clients}
      fetchClients={fetchClients}
      refreshClientBalance={handleRefreshClientBalance}
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
  );

  if (networkStateComponent.props.networkStatus !== 'online' || networkStateComponent.props.error) {
    return (
      <>
        {clientSubscription}
        {networkStateComponent}
      </>
    );
  }

  // Loading state component
  const loadingStateComponent = (
    <WithdrawalLoadingState
      isLoading={isLoading}
      error={error}
      retrying={retrying}
      withdrawalsCount={withdrawals.length}
    />
  );

  if (loadingStateComponent.props.isLoading && !loadingStateComponent.props.error && withdrawals.length === 0) {
    return (
      <>
        {clientSubscription}
        {loadingStateComponent}
      </>
    );
  }

  // Main content component
  return (
    <>
      {clientSubscription}
      <WithdrawalOperations
        withdrawals={withdrawals}
        clients={clients}
        fetchWithdrawals={useWithdrawals().fetchWithdrawals}
        fetchClients={fetchClients}
        refreshClientBalance={handleRefreshClientBalance}
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
        onEditWithdrawal={onEditWithdrawal}
        onDeleteWithdrawal={onDeleteWithdrawal}
      />
    </>
  );
};
