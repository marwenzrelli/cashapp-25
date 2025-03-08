
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
    setSelectedDeposit: setSelectedDeposit as unknown as (deposit: any) => void, // Fix type casting
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
