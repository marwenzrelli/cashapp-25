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
    confirmDeleteDeposit, 
    setShowDeleteDialog, 
    setDepositToDelete,
    fetchDeposits,
    depositToDelete // Ajouté pour passage à la vue
  } = useDeposits(); // ajout de depositToDelete

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
    // setSelectedDeposit non obligatoire ici
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
    fetchDeposits,
    depositToDelete // Ajoutée à l'API retournée
  };
};
