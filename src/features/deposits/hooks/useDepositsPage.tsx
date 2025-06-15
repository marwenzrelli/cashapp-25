
import { useDeposits } from "@/features/deposits/hooks/useDeposits";
import { useDepositSearch } from "./deposit-hooks/useDepositSearch";
import { useDepositDialogs } from "./deposit-hooks/useDepositDialogs";
import { useDepositActions } from "./deposit-hooks/useDepositActions";
import { DateRange } from "react-day-picker";

export const useDepositsPage = () => {
  const { 
    deposits, 
    isLoading,
    createDeposit, 
    deleteDeposit, 
    updateDeposit, 
    setShowDeleteDialog, 
    setDepositToDelete,
    fetchDeposits
  } = useDeposits();

  const {
    searchTerm,
    setSearchTerm,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    dateRange,
    setDateRange,
    filteredDeposits,
    paginatedDeposits,
    totalItems
  } = useDepositSearch(deposits);

  const {
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedDeposit,
    setSelectedDeposit,
    editForm,
    setEditForm,
    isDeleting,
    setIsDeleting,
    handleEdit,
    handleEditFormChange
  } = useDepositDialogs();

  const {
    handleDelete,
    handleConfirmEdit,
    handleCreateDeposit
  } = useDepositActions({
    createDeposit,
    updateDeposit,
    setDepositToDelete,
    setShowDeleteDialog,
    setIsDeleteDialogOpen,
    setIsEditDialogOpen,
    editForm,
    selectedDeposit
  });

  // Simplified function that refreshes deposits after deletion
  const confirmDelete = async (): Promise<boolean> => {
    console.log("[PAGE] confirmDelete - refreshing deposits");
    try {
      await fetchDeposits();
      return true;
    } catch (error) {
      console.error("[PAGE] Error refreshing deposits:", error);
      return false;
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedDeposit,
    setSelectedDeposit,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    dateRange,
    setDateRange,
    editForm,
    deposits,
    filteredDeposits,
    paginatedDeposits,
    isDeleting,
    isLoading,
    totalItems,
    
    handleDelete,
    confirmDelete,
    handleEdit,
    handleEditFormChange,
    handleConfirmEdit,
    handleCreateDeposit,
    fetchDeposits
  };
};
