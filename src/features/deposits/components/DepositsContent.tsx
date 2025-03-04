
import React from "react";
import { DepositsTable } from "./DepositsTable";
import { DepositsHeader } from "./DepositsHeader";
import { SearchBar } from "./SearchBar";
import { DeleteDepositDialog } from "./DeleteDepositDialog";
import { Deposit } from "../types";
import { useClients } from "@/features/clients/hooks/useClients";
import { StandaloneDepositForm } from "./DepositForm";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";

interface DepositsContentProps {
  deposits: Deposit[];
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
  confirmDelete: () => Promise<void>;
  handleEdit: (deposit: Deposit) => void;
  handleEditFormChange: (field: string, value: string) => void;
  handleConfirmEdit: () => Promise<void>;
  handleCreateDeposit: (deposit: Deposit) => Promise<void>;
}

export const DepositsContent = ({
  deposits,
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
  handleCreateDeposit
}: DepositsContentProps) => {
  const {
    clients,
    refreshClientBalance
  } = useClients();
  
  const filteredDeposits = deposits.filter(deposit => 
    deposit.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefreshClientBalance = async (clientId: string): Promise<boolean> => {
    try {
      await refreshClientBalance(parseInt(clientId, 10));
      return true;
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      return false;
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <DepositsHeader 
        deposits={deposits}
        filteredDeposits={filteredDeposits}
      />
      
      {/* Place the deposit form directly below statistics with the same width */}
      <div>
        <StandaloneDepositForm
          clients={clients}
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
          totalDeposits={filteredDeposits.length}
        />
        
        <TransferPagination
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalItems={filteredDeposits.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          label="versements"
        />
        
        <DepositsTable 
          deposits={paginatedDeposits} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      <DeleteDepositDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={confirmDelete} 
        selectedDeposit={selectedDeposit} 
      />
    </div>
  );
};
