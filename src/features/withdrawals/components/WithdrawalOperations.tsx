
import React from "react";
import { Operation } from "@/features/operations/types";
import { WithdrawalsContent } from "./WithdrawalsContent";
import { Client } from "@/features/clients/types";
import { toast } from "sonner";
import { Withdrawal } from "../types";

interface WithdrawalOperationsProps {
  withdrawals: Withdrawal[];
  clients: Client[];
  fetchWithdrawals: () => Promise<void>;
  fetchClients: () => Promise<void>;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredWithdrawals: Withdrawal[];
  paginatedWithdrawals: Withdrawal[];
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  confirmDeleteWithdrawal: () => Promise<boolean>;
  onEditWithdrawal?: (operation: Operation) => void;
  onDeleteWithdrawal?: (operation: Operation) => void;
}

export const WithdrawalOperations: React.FC<WithdrawalOperationsProps> = ({
  withdrawals,
  clients,
  fetchWithdrawals,
  fetchClients,
  refreshClientBalance,
  searchTerm,
  setSearchTerm,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  filteredWithdrawals,
  paginatedWithdrawals,
  showDeleteDialog,
  setShowDeleteDialog,
  confirmDeleteWithdrawal,
  onEditWithdrawal,
  onDeleteWithdrawal
}) => {
  // Create a wrapper function to handle the type mismatch
  const handleRefreshClientBalance = async (clientId: string): Promise<boolean> => {
    try {
      await refreshClientBalance(clientId);
      return true;
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      toast.error("Erreur lors de la mise à jour du solde", {
        description: "Veuillez réessayer"
      });
      return false;
    }
  };

  // Use custom handlers if provided, otherwise use default handlers
  const handleEditWithdrawal = (withdrawal: Withdrawal) => {
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
    }
  };

  const handleDeleteWithdrawal = (withdrawal: Withdrawal) => {
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
    }
  };

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
