
import { useState, useEffect, useCallback } from "react";
import { type Deposit, type EditFormData } from "@/components/deposits/types";
import { useDeposits } from "@/features/deposits/hooks/useDeposits";
import { toast } from "sonner";
import { formatISODateTime } from "@/features/deposits/hooks/utils/dateUtils";

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
    isLoading,
    createDeposit, 
    deleteDeposit, 
    updateDeposit, 
    confirmDeleteDeposit, 
    setShowDeleteDialog, 
    setDepositToDelete,
    fetchDeposits
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
    console.log("Ouverture du modal d'édition pour:", deposit);
    setSelectedDeposit(deposit);
    
    const formattedDateTime = formatISODateTime(deposit.created_at);
    
    setEditForm({
      clientName: deposit.client_name,
      amount: deposit.amount.toString(),
      notes: deposit.description || "",
      date: formattedDateTime.date,
      time: formattedDateTime.time
    });
    
    setIsEditDialogOpen(true);
    toast.info("Mode édition", {
      description: `Modification du versement de ${deposit.amount} TND`
    });
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string) => {
    console.log(`Mise à jour du champ ${field} avec la valeur:`, value);
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleConfirmEdit = async () => {
    if (!selectedDeposit) {
      console.error("Aucun versement sélectionné pour la modification");
      return;
    }

    console.log("Confirmation des modifications pour:", selectedDeposit);
    console.log("Nouvelles valeurs:", editForm);

    // Ensure we always have a date value
    const dateToUse = editForm.date || new Date().toISOString().split('T')[0];
    const timeToUse = editForm.time || '00:00:00';

    const updates = {
      client_name: editForm.clientName,
      amount: Number(editForm.amount),
      notes: editForm.notes,
      date: dateToUse,
      time: timeToUse
    };

    console.log("Final updates being sent:", updates);

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

  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * parseInt(itemsPerPage),
    currentPage * parseInt(itemsPerPage)
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return {
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
