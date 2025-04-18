import React from "react";
import { DepositsTable } from "./DepositsTable";
import { DepositsHeader } from "./DepositsHeader";
import { SearchBar } from "./SearchBar";
import { DeleteDepositDialog } from "./DeleteDepositDialog";
import { Deposit } from "../types";
import { useClients } from "@/features/clients/hooks/useClients";
import { StandaloneDepositForm } from "./DepositForm";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { EditDepositDialog } from "./dialog/EditDepositDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";
import { DateRange } from "react-day-picker";
import { NewDepositButton } from "./NewDepositButton";
import { NewDepositDialog } from "./deposit-dialog/NewDepositDialog";

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
  handleConfirmEdit: () => Promise<boolean>;
  handleCreateDeposit: (deposit: Deposit) => Promise<boolean>;
  isLoading?: boolean;
  totalItems?: number;
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
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
  dateRange,
  setDateRange
}: DepositsContentProps) => {
  // Add state for new deposit dialog
  const [isNewDepositOpen, setIsNewDepositOpen] = React.useState(false);

  const {
    clients,
    refreshClientBalance,
    fetchClients
  } = useClients();
  
  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  console.log("DepositsContent render with:", {
    depositsLength: deposits?.length,
    filteredDepositsLength: filteredDeposits?.length,
    paginatedDepositsLength: paginatedDeposits?.length,
    isLoading,
    selectedDepositForDeletion: selectedDeposit?.id,
    dateRange
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

  const extendedClients: ExtendedClient[] = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  return (
    <div className="space-y-8 animate-in px-2 sm:px-4 md:px-6 w-full">
      <DepositsHeader 
        deposits={deposits}
        filteredDeposits={filteredDeposits}
        isLoading={isLoading}
      />
      
      <div className="w-full flex justify-end">
        <NewDepositButton onClick={() => setIsNewDepositOpen(true)} />
      </div>

      <div className="space-y-4 w-full">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalDeposits={totalItems}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
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
          <div className="space-y-4 w-full">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          paginatedDeposits && paginatedDeposits.length > 0 ? (
            <DepositsTable 
              deposits={paginatedDeposits} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              dateRange={dateRange}
            />
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 w-full">
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

      {/* Add the new deposit dialog */}
      <NewDepositDialog
        isOpen={isNewDepositOpen}
        onOpenChange={setIsNewDepositOpen}
        clients={extendedClients}
        onConfirm={handleCreateDeposit}
        refreshClientBalance={handleRefreshClientBalance}
      />

      <DeleteDepositDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={confirmDelete} 
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
