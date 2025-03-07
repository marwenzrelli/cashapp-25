
import { useDeposits } from "@/features/deposits/hooks/useDeposits";
import { useDepositSearch } from "./deposit-hooks/useDepositSearch";
import { useDepositDialogs } from "./deposit-hooks/useDepositDialogs";
import { useDepositActions } from "./deposit-hooks/useDepositActions";

export const useDepositsPage = () => {
  const { 
    deposits, 
    isLoading,
    createDeposit, 
    deleteDeposit, 
    updateDeposit, 
    confirmDeleteDeposit, 
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
    filteredDeposits,
    paginatedDeposits
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
    confirmDelete,
    handleConfirmEdit,
    handleCreateDeposit
  } = useDepositActions({
    createDeposit,
    updateDeposit,
    confirmDeleteDeposit,
    setDepositToDelete,
    setShowDeleteDialog,
    setIsDeleteDialogOpen,
    setIsEditDialogOpen,
    editForm,
    selectedDeposit,
    setIsDeleting
  });

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
    editForm,
    deposits,
    filteredDeposits,
    paginatedDeposits,
    isDeleting,
    isLoading,
    
    handleDelete,
    confirmDelete,
    handleEdit,
    handleEditFormChange,
    handleConfirmEdit,
    handleCreateDeposit,
    fetchDeposits
  };
};
