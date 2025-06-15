
import React, { useState, useEffect, memo } from "react";
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
  depositToDelete?: Deposit | null;
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

// Use memo to prevent unnecessary re-renders of the DepositsContent component
export const DepositsContent = memo(({
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
  depositToDelete,
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
  const {
    clients,
    refreshClientBalance,
    fetchClients
  } = useClients();
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Moved logging to an effect to prevent continuous re-renders
  useEffect(() => {
    console.log("DepositsContent render with:", {
      depositsLength: deposits?.length,
      filteredDepositsLength: filteredDeposits?.length,
      paginatedDepositsLength: paginatedDeposits?.length,
      isLoading,
      depositToDelete: depositToDelete?.id,
      selectedDeposit: selectedDeposit?.id
    });
  }, [
    deposits?.length, 
    filteredDeposits?.length, 
    paginatedDeposits?.length, 
    isLoading, 
    depositToDelete?.id,
    selectedDeposit?.id
  ]);

  return (
    <div className="space-y-8 animate-in px-2 sm:px-4 md:px-6 w-full">
      <DepositsHeader 
        deposits={deposits}
        filteredDeposits={filteredDeposits}
        isLoading={isLoading}
      />

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

      <DeleteDepositDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={confirmDelete} 
        selectedDeposit={depositToDelete || selectedDeposit} 
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
});

// Add display name for debugging purposes
DepositsContent.displayName = "DepositsContent";
