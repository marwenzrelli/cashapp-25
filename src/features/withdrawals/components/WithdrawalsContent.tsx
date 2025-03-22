import React, { useState } from "react";
import { StandaloneWithdrawalForm } from "./standalone/StandaloneWithdrawalForm";
import { WithdrawalTable } from "./WithdrawalTable";
import { WithdrawalHeader } from "./WithdrawalHeader";
import { SearchBar } from "./SearchBar";
import { DeleteWithdrawalDialog } from "./DeleteWithdrawalDialog";
import { WithdrawalDialogContainer } from "./WithdrawalDialogContainer";
import { Withdrawal } from "../types";
import { Client } from "@/features/clients/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

import { ExtendedClient } from "../hooks/form/withdrawalFormTypes";

interface WithdrawalsContentProps {
  withdrawals: Withdrawal[];
  paginatedWithdrawals: Withdrawal[];
  clients: Client[];
  fetchWithdrawals: () => void;
  fetchClients: () => void;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
  deleteWithdrawal: (withdrawal: Withdrawal) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  confirmDeleteWithdrawal: () => Promise<boolean>;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
}

export const WithdrawalsContent: React.FC<WithdrawalsContentProps> = ({
  withdrawals,
  paginatedWithdrawals,
  clients,
  fetchWithdrawals,
  fetchClients,
  refreshClientBalance,
  deleteWithdrawal,
  showDeleteDialog,
  setShowDeleteDialog,
  confirmDeleteWithdrawal,
  searchTerm = "",
  setSearchTerm = () => {},
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  dateRange,
  setDateRange = () => {}
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const findClientById = (clientName: string) => {
    const client = clients.find(c => `${c.prenom} ${c.nom}` === clientName);
    return client ? {
      ...client,
      dateCreation: client.date_creation || new Date().toISOString()
    } : null;
  };

  const handleDeleteWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    deleteWithdrawal(withdrawal);
  };

  const handleEdit = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setSelectedClient(withdrawal.client_name);
    setIsEditing(true);
    setShowDialog(true);
  };

  const extendedClients: ExtendedClient[] = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  const handleFetchWithdrawals = async (): Promise<void> => {
    try {
      fetchWithdrawals();
      return Promise.resolve();
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Erreur lors du chargement des retraits", {
        description: "Veuillez réessayer ultérieurement"
      });
      return Promise.reject(error);
    }
  };

  const handleWithdrawalConfirm = async (withdrawal: any): Promise<void> => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          client_name: withdrawal.client_name,
          amount: withdrawal.amount,
          operation_date: withdrawal.date,
          notes: withdrawal.notes
        });

      if (error) {
        console.error("Erreur lors de l'ajout du retrait:", error);
        toast.error("Erreur lors de l'ajout du retrait");
        throw error;
      }

      toast.success("Retrait ajouté avec succès");
      await handleFetchWithdrawals();
    } catch (error) {
      console.error("Error confirming withdrawal:", error);
      toast.error("Erreur lors de la confirmation du retrait");
      throw error;
    }
  };

  return (
    <div className="space-y-8 animate-in w-full px-0 sm:px-0">
      <WithdrawalHeader withdrawals={withdrawals} />

      <div className="w-full">
        <StandaloneWithdrawalForm 
          clients={extendedClients} 
          onConfirm={handleWithdrawalConfirm} 
          refreshClientBalance={refreshClientBalance} 
        />
      </div>

      <Card className="w-full mx-0">
        <CardHeader>
          <CardTitle>Recherche intelligente</CardTitle>
          <CardDescription>
            Trouvez rapidement un retrait
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalWithdrawals={withdrawals.length}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </CardContent>
      </Card>

      <TransferPagination
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={withdrawals.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        label="retraits"
      />

      <WithdrawalTable 
        withdrawals={paginatedWithdrawals} 
        onEdit={handleEdit} 
        onDelete={handleDeleteWithdrawal} 
        findClientById={findClientById}
        dateRange={dateRange}
      />

      {showDialog && (
        <WithdrawalDialogContainer 
          showDialog={showDialog} 
          setShowDialog={setShowDialog} 
          clients={clients} 
          selectedClient={selectedClient} 
          setSelectedClient={setSelectedClient} 
          isEditing={isEditing} 
          selectedWithdrawal={selectedWithdrawal} 
          fetchWithdrawals={handleFetchWithdrawals} 
          refreshClientBalance={refreshClientBalance} 
        />
      )}

      <DeleteWithdrawalDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog} 
        onConfirm={confirmDeleteWithdrawal} 
        withdrawal={selectedWithdrawal} 
      />
    </div>
  );
};
