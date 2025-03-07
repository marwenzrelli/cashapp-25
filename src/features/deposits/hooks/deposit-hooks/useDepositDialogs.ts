
import { useState } from "react";
import { Deposit, EditFormData } from "@/components/deposits/types";
import { formatISODateTime } from "../utils/dateUtils";
import { toast } from "sonner";

export const useDepositDialogs = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    clientName: "",
    amount: "",
    notes: ""
  });
  const [isDeleting, setIsDeleting] = useState(false);

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

  return {
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
  };
};
