
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
import { Operation } from "@/features/operations/types";

interface WithdrawalsPageProps {
  onEditWithdrawal?: (operation: Operation) => void;
  onDeleteWithdrawal?: (operation: Operation) => void;
}

export const WithdrawalsPage: React.FC<WithdrawalsPageProps> = ({ 
  onEditWithdrawal, 
  onDeleteWithdrawal 
}) => {
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

  // Use custom handlers if provided, otherwise use default handlers
  const handleEditWithdrawal = (withdrawal: any) => {
    if (onEditWithdrawal) {
      // Convert withdrawal to Operation format and pass to custom handler
      const operation: Operation = {
        id: withdrawal.id,
        amount: withdrawal.amount,
        date: withdrawal.operation_date || withdrawal.created_at,
        type: "withdrawal",
        fromClient: withdrawal.client_name,
        description: withdrawal.notes || "",
      };
      onEditWithdrawal(operation);
    } else {
      // Use default edit handler if available
      // This would be defined if we had an internal edit implementation
    }
  };

  const handleDeleteWithdrawal = (withdrawal: any) => {
    if (onDeleteWithdrawal) {
      // Convert withdrawal to Operation format and pass to custom handler
      const operation: Operation = {
        id: withdrawal.id,
        amount: withdrawal.amount,
        date: withdrawal.operation_date || withdrawal.created_at,
        type: "withdrawal",
        fromClient: withdrawal.client_name,
        description: withdrawal.notes || "",
      };
      onDeleteWithdrawal(operation);
    } else {
      // Use default delete handler from useWithdrawals
      deleteWithdrawal(withdrawal);
    }
  };

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
            refreshClientBalance={handleRefreshClientBalance}
            deleteWithdrawal={handleDeleteWithdrawal}
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
      deleteWithdrawal={handleDeleteWithdrawal}
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
