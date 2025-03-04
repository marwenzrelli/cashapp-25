
import React from "react";
import { StandaloneDepositForm } from "./DepositForm";
import { DepositsTable } from "./DepositsTable";
import { DepositsHeader } from "./DepositsHeader";
import { QuickActions } from "./QuickActions";
import { DeleteDepositDialog } from "./DeleteDepositDialog";
import { DepositDialogContainer } from "./DepositDialogContainer";
import { Deposit } from "../types";
import { useClients } from "@/features/clients/hooks/useClients";

interface DepositsContentProps {
  deposits: Deposit[];
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
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        itemsPerPage={itemsPerPage} 
        onItemsPerPageChange={setItemsPerPage} 
        onNewDeposit={() => setIsDialogOpen(true)} 
        filteredDeposits={filteredDeposits}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StandaloneDepositForm 
            clients={clients} 
            onConfirm={handleCreateDeposit} 
            refreshClientBalance={handleRefreshClientBalance} 
          />
        </div>
        <div>
          <QuickActions 
            onCreateClick={() => setIsDialogOpen(true)}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            depositsCount={filteredDeposits.length}
          />
        </div>
      </div>

      <DepositsTable 
        deposits={filteredDeposits} 
        itemsPerPage={itemsPerPage} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <DepositDialogContainer 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        clients={clients} 
        onConfirm={handleCreateDeposit} 
        refreshClientBalance={handleRefreshClientBalance} 
      />

      <DeleteDepositDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={confirmDelete} 
        selectedDeposit={selectedDeposit} 
      />
    </div>
  );
};
