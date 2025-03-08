
import React from "react";
import { Deposit } from "@/features/deposits/types"; // Use deposit type consistently
import { useClients } from "@/features/clients/hooks/useClients";
import { ExtendedClient } from "@/features/withdrawals/components/standalone/StandaloneWithdrawalForm";
import { toast } from "sonner";
import { adaptDepositsForUI } from "../utils/depositAdapters";

import { 
  DepositsContentHeader,
  DepositsSearchSection,
  DepositsTableSection,
  DepositsDialogs
} from "./content";

interface DepositsContentProps {
  deposits: any[];
  filteredDeposits: any[];
  paginatedDeposits: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  selectedDeposit: any | null;
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  editForm: any;
  handleDelete: (deposit: any) => void;
  confirmDelete: () => Promise<boolean>;
  handleEdit: (deposit: any) => void;
  handleEditFormChange: (field: string, value: string) => void;
  handleConfirmEdit: () => Promise<void>;
  handleCreateDeposit: (deposit: any) => Promise<void>;
  isLoading?: boolean;
  totalItems?: number;
  fetchDeposits?: () => Promise<void>;
}

export const DepositsContent = ({
  deposits,
  filteredDeposits,
  paginatedDeposits,
  searchTerm,
  setSearchTerm,
  isDialogOpen,
  setIsDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedDeposit,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  editForm,
  handleDelete,
  confirmDelete,
  handleEdit,
  handleEditFormChange,
  handleConfirmEdit,
  handleCreateDeposit,
  isLoading = false,
  totalItems = 0,
  fetchDeposits
}: DepositsContentProps) => {
  const {
    clients,
    refreshClientBalance,
    fetchClients
  } = useClients();

  const handleRefreshClientBalance = async (clientId: string): Promise<boolean> => {
    try {
      await refreshClientBalance(parseInt(clientId, 10));
      return true;
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      return false;
    }
  };

  const onConfirmDelete = async () => {
    try {
      const success = await confirmDelete();
      if (success && fetchDeposits) {
        toast.success("Versement supprimé avec succès");
        // Rafraîchir la liste des dépôts après une suppression réussie
        await fetchDeposits();
      }
      return success;
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      return false;
    }
  };

  const extendedClients: ExtendedClient[] = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  // Use our adapter to ensure all deposits have the required fields
  const adaptedDeposits = adaptDepositsForUI(deposits);
  const adaptedFilteredDeposits = adaptDepositsForUI(filteredDeposits);
  const adaptedPaginatedDeposits = adaptDepositsForUI(paginatedDeposits);

  return (
    <div className="space-y-8 animate-in">
      <DepositsContentHeader 
        deposits={adaptedDeposits}
        filteredDeposits={adaptedFilteredDeposits}
        isLoading={isLoading}
        clients={extendedClients}
        handleCreateDeposit={handleCreateDeposit}
        handleRefreshClientBalance={handleRefreshClientBalance}
        fetchClients={fetchClients}
      />
      
      <div className="space-y-4">
        <DepositsSearchSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalItems={totalItems}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        
        <DepositsTableSection
          isLoading={isLoading}
          paginatedDeposits={adaptedPaginatedDeposits}
          searchTerm={searchTerm}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>

      <DepositsDialogs
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        selectedDeposit={selectedDeposit}
        editForm={editForm}
        handleEditFormChange={handleEditFormChange}
        handleConfirmEdit={handleConfirmEdit}
        confirmDelete={onConfirmDelete}
        clients={clients}
      />
    </div>
  );
};
