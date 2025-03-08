
import React, { useEffect } from "react";
import { DepositsTable } from "./DepositsTable";
import { DepositsHeader } from "./DepositsHeader";
import { SearchBar } from "./SearchBar";
import { DeleteDepositDialog } from "./DeleteDepositDialog";
import { Deposit } from "../types"; // Using the feature's Deposit type
import { useClients } from "@/features/clients/hooks/useClients";
import { StandaloneDepositForm } from "./DepositForm";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { EditDepositDialog } from "./dialog/EditDepositDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ExtendedClient } from "@/features/withdrawals/components/standalone/StandaloneWithdrawalForm";
import { toast } from "sonner";

// Define a type adapter function to ensure deposits have required fields
const adaptDepositsForUI = (deposits: Deposit[]) => {
  return deposits.map(deposit => ({
    ...deposit,
    description: deposit.description || deposit.notes || ""  // Ensure description is always present
  }));
};

interface DepositsContentProps {
  deposits: Deposit[];
  filteredDeposits: Deposit[];
  paginatedDeposits: Deposit[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  selectedDeposit: Deposit | null;
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  editForm: any;
  handleDelete: (deposit: Deposit) => void;
  confirmDelete: () => Promise<boolean>;
  handleEdit: (deposit: Deposit) => void;
  handleEditFormChange: (field: string, value: string) => void;
  handleConfirmEdit: () => Promise<void>;
  handleCreateDeposit: (deposit: Deposit) => Promise<void>;
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
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Nouveau useEffect pour rafraîchir les dépôts après une suppression
  useEffect(() => {
    if (!isDeleteDialogOpen && selectedDeposit && fetchDeposits) {
      // Si le dialogue de suppression vient d'être fermé et qu'un dépôt était sélectionné
      // cela signifie probablement qu'une suppression a été effectuée
      console.log("Rafraîchissement des dépôts après fermeture du dialogue de suppression");
      fetchDeposits();
    }
  }, [isDeleteDialogOpen, selectedDeposit, fetchDeposits]);

  console.log("DepositsContent render with:", {
    depositsLength: deposits?.length,
    filteredDepositsLength: filteredDeposits?.length,
    paginatedDepositsLength: paginatedDeposits?.length,
    isLoading,
    deleteDialogOpen: isDeleteDialogOpen
  });

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

  // Adapt deposits for UI components
  const adaptedDeposits = adaptDepositsForUI(deposits);
  const adaptedFilteredDeposits = adaptDepositsForUI(filteredDeposits);
  const adaptedPaginatedDeposits = adaptDepositsForUI(paginatedDeposits);

  return (
    <div className="space-y-8 animate-in">
      <DepositsHeader 
        deposits={adaptedDeposits}
        filteredDeposits={adaptedFilteredDeposits}
        isLoading={isLoading}
      />
      
      <div>
        <StandaloneDepositForm
          clients={extendedClients}
          onConfirm={handleCreateDeposit}
          refreshClientBalance={handleRefreshClientBalance}
        />
      </div>

      <div className="space-y-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalDeposits={totalItems}
        />
        
        <TransferPagination
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalItems={totalItems}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          label="versements"
        />
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          adaptedPaginatedDeposits && adaptedPaginatedDeposits.length > 0 ? (
            <DepositsTable 
              deposits={adaptedPaginatedDeposits} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Aucun versement trouvé</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Essayez de modifier vos critères de recherche
                </p>
              )}
            </div>
          )
        )}
      </div>

      <DeleteDepositDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={onConfirmDelete} 
        selectedDeposit={selectedDeposit} 
      />

      <EditDepositDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editForm={editForm}
        onEditFormChange={handleEditFormChange}
        onConfirm={handleConfirmEdit}
        selectedDeposit={selectedDeposit}
        clients={clients}
      />
    </div>
  );
};
