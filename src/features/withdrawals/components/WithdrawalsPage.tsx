
import React, { useState, useEffect } from "react";
import { useWithdrawals } from "../hooks/useWithdrawals";
import { useClients } from "@/features/clients/hooks/useClients";
import { useClientSubscription } from "./useClientSubscription";
import { WithdrawalsContent } from "./WithdrawalsContent";
import { LoadingState } from "@/features/admin/components/administration/LoadingState";
import { NetworkStatusAlerts } from "./NetworkStatusAlerts";
import { ErrorRetryButton } from "./ErrorRetryButton";
import { AuthRetryButton } from "./AuthRetryButton";
import { useWithdrawalPagination } from "../hooks/useWithdrawalPagination";

export const WithdrawalsPage: React.FC = () => {
  const { 
    withdrawals, 
    isLoading,
    error,
    fetchWithdrawals, 
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    showDeleteDialog,
    setShowDeleteDialog,
    isAuthenticated,
    authChecking,
    checkAuth,
    networkStatus,
    retrying
  } = useWithdrawals();

  const [retryingAuth, setRetryingAuth] = useState(false);

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated, fetchClients]);

  useClientSubscription({ fetchClients });

  const handleAuthRetry = async () => {
    setRetryingAuth(true);
    await checkAuth();
    if (isAuthenticated) {
      fetchClients();
      fetchWithdrawals();
    }
    setRetryingAuth(false);
  };

  // Create a wrapper function to handle the type mismatch
  const handleRefreshClientBalance = async (clientId: string): Promise<boolean> => {
    try {
      await refreshClientBalance(parseInt(clientId, 10));
      return true;
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      return false;
    }
  };

  // If still checking auth status, show loading state
  if (authChecking && !isAuthenticated) {
    return <LoadingState message="Vérification de l'authentification..." variant="minimal" />;
  }

  // If not authenticated
  if (isAuthenticated === false) {
    return (
      <AuthRetryButton 
        retryingAuth={retryingAuth}
        onRetry={handleAuthRetry}
      />
    );
  }

  // Network status alerts
  if (networkStatus === 'offline' || networkStatus === 'reconnecting' || error) {
    return (
      <NetworkStatusAlerts 
        networkStatus={networkStatus}
        isLoading={isLoading}
        retrying={retrying}
        error={error}
        fetchWithdrawals={fetchWithdrawals}
      />
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <>
        <NetworkStatusAlerts 
          networkStatus={networkStatus}
          isLoading={isLoading}
          retrying={retrying}
          error={error}
          fetchWithdrawals={fetchWithdrawals}
        />
        
        <ErrorRetryButton 
          onRetry={fetchWithdrawals}
          isLoading={isLoading}
          retrying={retrying}
        />
        
        {!isLoading && withdrawals.length > 0 && (
          <WithdrawalsContent
            withdrawals={filteredWithdrawals}
            paginatedWithdrawals={paginatedWithdrawals}
            clients={clients}
            fetchWithdrawals={fetchWithdrawals}
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
        )}
      </>
    );
  }

  // Show loading state while fetching data
  if (isLoading && !error && withdrawals.length === 0) {
    return <LoadingState message="Chargement des retraits..." retrying={retrying} />;
  }

  // Main content
  return (
    <WithdrawalsContent
      withdrawals={filteredWithdrawals}
      paginatedWithdrawals={paginatedWithdrawals}
      clients={clients}
      fetchWithdrawals={fetchWithdrawals}
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
};
