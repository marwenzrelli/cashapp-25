
import React from "react";
import { DepositsTable } from "./DepositsTable";
import { DepositsHeader } from "./DepositsHeader";
import { SearchBar } from "./SearchBar";
import { DeleteDepositDialog } from "./DeleteDepositDialog";
import { DepositDialogContainer } from "./DepositDialogContainer";
import { Deposit } from "../types";
import { useClients } from "@/features/clients/hooks/useClients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        filteredDeposits={filteredDeposits}
      />

      <Card>
        <CardHeader>
          <CardTitle>Nouveau versement</CardTitle>
          <CardDescription>
            Créez un nouveau versement pour un client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Only show the New Deposit button here, not the full form */}
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full py-3 px-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors flex items-center justify-center"
          >
            + Créer un nouveau versement
          </button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          onNewDeposit={() => setIsDialogOpen(true)}
          totalDeposits={filteredDeposits.length}
        />
        
        <DepositsTable 
          deposits={filteredDeposits} 
          itemsPerPage={itemsPerPage} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

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
