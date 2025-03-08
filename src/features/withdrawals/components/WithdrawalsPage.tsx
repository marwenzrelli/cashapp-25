
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
import { toast } from "sonner";

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
      fetchClients().catch(err => {
        console.error("Error fetching clients:", err);
        toast.error("Erreur lors du chargement des clients", {
          description: "Veuillez réessayer ultérieurement"
        });
      });
    }
  }, [isAuthenticated, fetchClients]);

  // Subscribe to real-time client updates
  useClientSubscription({ fetchClients });

  const handleAuthRetry = async () => {
    setRetryingAuth(true);
    try {
      await checkAuth();
      if (isAuthenticated) {
        await fetchClients();
        await fetchWithdrawals();
      }
    } catch (error) {
      console.error("Error during auth retry:", error);
      toast.error("Erreur lors de l'authentification", {
        description: "Veuillez vous reconnecter"
      });
    } finally {
      setRetryingAuth(false);
    }
  };

  // Create a wrapper function to handle the type mismatch
  const handleRefreshClientBalance = async (clientId: string): Promise<boolean> => {
    try {
      await refreshClientBalance(parseInt(clientId, 10));
      return true;
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      toast.error("Erreur lors de la mise à jour du solde", {
        description: "Veuillez réessayer"
      });
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

  // Network status alerts or error state
  if (networkStatus === 'offline' || networkStatus === 'reconnecting' || error) {
    return (
      <div className="w-full max-w-full px-0 sm:px-0">
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
      </div>
    );
  }

  // Show loading state while fetching data
  if (isLoading && !error && withdrawals.length === 0) {
    return <LoadingState message="Chargement des retraits..." retrying={retrying} />;
  }

  // Main content
  return (
    <div className="w-full max-w-full px-0 sm:px-0">
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
    </div>
  );
};
