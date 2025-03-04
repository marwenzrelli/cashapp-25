
import React, { useState } from "react";
import { StandaloneDepositForm } from "./DepositForm";
import { DepositsTable } from "./DepositsTable";
import { DepositsHeader } from "./DepositsHeader";
import { QuickActions } from "./QuickActions";
import { DeleteDepositDialog } from "./DeleteDepositDialog";
import { DepositDialogContainer } from "./DepositDialogContainer";
import { Deposit } from "../types";
import { Client } from "@/features/clients/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const { clients, fetchClients, refreshClientBalance } = useClients();

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
      <DepositsHeader />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StandaloneDepositForm
            clients={clients}
            onConfirm={handleCreateDeposit}
            refreshClientBalance={handleRefreshClientBalance}
          />
        </div>
        
        <div className="space-y-6">
          <QuickActions
            onCreateClick={() => setIsDialogOpen(true)}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            depositsCount={deposits.length}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Recherche intelligente</CardTitle>
              <CardDescription>
                Trouvez rapidement un versement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, notes, ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={itemsPerPage}
                  onValueChange={setItemsPerPage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nombre d'éléments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 éléments</SelectItem>
                    <SelectItem value="25">25 éléments</SelectItem>
                    <SelectItem value="50">50 éléments</SelectItem>
                    <SelectItem value="100">100 éléments</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  {deposits.length} résultats trouvés
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DepositsTable
        deposits={deposits}
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
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        deposit={selectedDeposit}
      />
    </div>
  );
};
