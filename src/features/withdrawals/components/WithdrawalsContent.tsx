import React from "react";
import { WithdrawalTable } from "./WithdrawalTable";
import { WithdrawalHeader } from "./WithdrawalHeader";
import { DeleteWithdrawalDialog } from "./DeleteWithdrawalDialog";
import { WithdrawalDialogContainer } from "./WithdrawalDialogContainer";
import { NewWithdrawalButton } from "./NewWithdrawalButton";
import { SearchSection } from "./sections/SearchSection";
import { WithdrawalFormSection } from "./sections/WithdrawalFormSection";
import { Withdrawal } from "../types";
import { Client } from "@/features/clients/types";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { WithdrawalTotals } from "./WithdrawalTotals";
import { ExtendedClient } from "../hooks/form/withdrawalFormTypes";
import { useWithdrawalState } from "../hooks/useWithdrawalState";

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
  const {
    showDialog,
    setShowDialog,
    selectedClient,
    setSelectedClient,
    selectedWithdrawal,
    setSelectedWithdrawal,
    isEditing,
    handleNewWithdrawal,
    handleEdit,
    findClientById
  } = useWithdrawalState();

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
      const client = clients.find(c => `${c.prenom} ${c.nom}` === withdrawal.client_name);
      const clientId = client ? client.id : undefined;

      const { error } = await supabase
        .from('withdrawals')
        .insert({
          client_name: withdrawal.client_name,
          client_id: clientId,
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

  const getDateRangeText = () => {
    if (dateRange?.from && dateRange?.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      
      const formatDatePart = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      };
      
      return `du ${formatDatePart(fromDate)} au ${formatDatePart(toDate)}`;
    }
    return "pour toute la période";
  };

  const extendedClients: ExtendedClient[] = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  return (
    <div className="space-y-8 animate-in w-full px-0 sm:px-0">
      <WithdrawalHeader withdrawals={withdrawals} />

      <div className="flex justify-center w-full">
        <NewWithdrawalButton onClick={handleNewWithdrawal} />
      </div>

      <WithdrawalFormSection
        clients={extendedClients}
        onConfirm={handleWithdrawalConfirm}
        refreshClientBalance={refreshClientBalance}
      />

      <SearchSection
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalWithdrawals={withdrawals.length}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

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
        onDelete={deleteWithdrawal} 
        findClientById={(clientName) => findClientById(clients, clientName)}
        dateRange={dateRange}
      />
      
      <WithdrawalTotals 
        withdrawals={withdrawals}
        paginatedWithdrawals={paginatedWithdrawals}
        dateRangeText={getDateRangeText()}
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
