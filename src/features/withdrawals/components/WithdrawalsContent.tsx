
import React, { useState } from "react";
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
import { StandaloneWithdrawalForm } from "./standalone/StandaloneWithdrawalForm";

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
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);

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
    setSelectedWithdrawal(handleDelete(withdrawal));
    deleteWithdrawal(withdrawal);
  };

  const handleWithdrawalSuccess = () => {
    fetchWithdrawals();
    setShowWithdrawalForm(false);
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

  const extendedClients = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in w-full">
      <WithdrawalHeader withdrawals={withdrawals} />

      <NewWithdrawalButton 
        onClick={() => setShowWithdrawalForm(true)}
        isVisible={!showWithdrawalForm}
      />

      {showWithdrawalForm && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <StandaloneWithdrawalForm
              clients={extendedClients}
              onConfirm={async (withdrawal) => {
                // Handle withdrawal creation logic here
                console.log("Creating withdrawal:", withdrawal);
                return true;
              }}
              refreshClientBalance={refreshClientBalance}
              onSuccess={handleWithdrawalSuccess}
              onCancel={() => setShowWithdrawalForm(false)}
            />
          </div>
        </div>
      )}

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
