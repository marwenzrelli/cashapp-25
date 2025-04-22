
import React from "react";
import { WithdrawalTable } from "./WithdrawalTable";
import { WithdrawalHeader } from "./WithdrawalHeader";
import { DeleteWithdrawalDialog } from "./DeleteWithdrawalDialog";
import { WithdrawalDialogContainer } from "./WithdrawalDialogContainer";
import { NewWithdrawalButton } from "./NewWithdrawalButton";
import { SearchSection } from "./sections/SearchSection";
import { Withdrawal } from "../types";
import { Client } from "@/features/clients/types";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { DateRange } from "react-day-picker";
import { WithdrawalTotals } from "./WithdrawalTotals";
import { useWithdrawalState } from "../hooks/useWithdrawalState";
import { toast } from "sonner";

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
    handleDelete,
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

  const handleDeleteWithdrawal = (withdrawal: Withdrawal) => {
    // First set the selected withdrawal using our state hook
    setSelectedWithdrawal(handleDelete(withdrawal));
    // Then call the passed in delete function which will show the dialog
    deleteWithdrawal(withdrawal);
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

  return (
    <div className="space-y-8 animate-in w-full px-0 sm:px-0">
      <WithdrawalHeader withdrawals={withdrawals} />

      <div className="flex justify-center w-full">
        <NewWithdrawalButton onClick={handleNewWithdrawal} />
      </div>

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
        onDelete={handleDeleteWithdrawal} 
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
