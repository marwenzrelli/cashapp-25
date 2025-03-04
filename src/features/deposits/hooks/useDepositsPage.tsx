
import { useState } from "react";
import { type Deposit, type EditFormData } from "@/components/deposits/types";
import { useDeposits } from "@/features/deposits/hooks/useDeposits";
import { toast } from "sonner";

export const useDepositsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState<EditFormData>({
    clientName: "",
    amount: "",
    notes: ""
  });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    deposits, 
    createDeposit, 
    deleteDeposit, 
    updateDeposit, 
    confirmDeleteDeposit, 
    setShowDeleteDialog, 
    setDepositToDelete 
  } = useDeposits();

  const handleDelete = (deposit: Deposit) => {
    console.log("Demande de suppression pour le versement:", deposit);
    setSelectedDeposit(deposit);
    setDepositToDelete(deposit);
    setIsDeleteDialogOpen(true);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedDeposit) {
      toast.error("Aucun versement sélectionné");
      return;
    }
    
    setIsDeleting(true);
    console.log("Confirmation de suppression pour:", selectedDeposit);
    
    try {
      const success = await confirmDeleteDeposit();
      
      if (success) {
        setIsDeleteDialogOpen(false);
        toast.success("Versement supprimé avec succès", {
          description: `Le versement de ${selectedDeposit.amount} TND a été supprimé.`
        });
      } else {
        console.error("La suppression a échoué mais sans erreur lancée");
        toast.error("Échec de la suppression du versement", {
          description: "La suppression n'a pas pu être effectuée. Veuillez réessayer."
        });
      }
    } catch (error: any) {
      console.error("Erreur détaillée lors de la suppression:", {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      toast.error("Échec de la suppression du versement", {
        description: error.message || "Une erreur est survenue lors de la suppression"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setEditForm({
      clientName: deposit.client_name,
      amount: deposit.amount.toString(),
      notes: deposit.description
    });
    setIsEditDialogOpen(true);
    toast.info("Mode édition", {
      description: `Modification du versement de ${deposit.amount} TND`
    });
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmEdit = async () => {
    if (!selectedDeposit) return;

    const updates = {
      client_name: editForm.clientName,
      amount: Number(editForm.amount),
      notes: editForm.notes
    };

    const success = await updateDeposit(selectedDeposit.id, updates);
    if (success) {
      setIsEditDialogOpen(false);
      toast.success("Versement mis à jour", {
        description: `Le versement a été modifié avec succès.`
      });
    }
  };

  const handleCreateDeposit = async (deposit: Deposit) => {
    const success = await createDeposit(deposit);
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const filteredDeposits = deposits.filter(deposit => {
    if (!searchTerm.trim()) return true;
    
    const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());
    
    return searchTerms.some(term => {
      if (deposit.client_name.toLowerCase().includes(term)) return true;
      
      if (deposit.description && deposit.description.toLowerCase().includes(term)) return true;
      
      if (deposit.id.toString().includes(term)) return true;
      
      return false;
    });
  });

  // Calculate pagination
  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * parseInt(itemsPerPage),
    currentPage * parseInt(itemsPerPage)
  );

  // Reset to first page when search changes
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Reset to first page when items per page changes
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return {
    // State
    searchTerm,
    setSearchTerm: handleSearchChange,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedDeposit,
    setSelectedDeposit,
    itemsPerPage,
    setItemsPerPage: handleItemsPerPageChange,
    currentPage,
    setCurrentPage,
    editForm,
    deposits,
    filteredDeposits,
    paginatedDeposits,
    isDeleting,
    
    // Actions
    handleDelete,
    confirmDelete,
    handleEdit,
    handleEditFormChange,
    handleConfirmEdit,
    handleCreateDeposit
  };
};
