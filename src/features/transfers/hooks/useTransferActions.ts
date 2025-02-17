
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Transfer, EditFormData } from "../types";
import { useClients } from "@/features/clients/hooks/useClients";

export const useTransferActions = (onSuccess: () => void) => {
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    fromClient: "",
    toClient: "",
    amount: "",
    reason: "",
  });

  const { refreshClientBalance, fetchClients } = useClients();

  const handleEdit = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setEditForm({
      fromClient: transfer.fromClient,
      toClient: transfer.toClient,
      amount: transfer.amount.toString(),
      reason: transfer.reason,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setIsDeleteDialogOpen(true);
  };

  const findClientByFullName = async (fullName: string) => {
    console.log("Recherche du client:", fullName);
    const [prenom, ...nomParts] = fullName.split(' ');
    const nom = nomParts.join(' ');

    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .eq('prenom', prenom)
      .eq('nom', nom)
      .single();

    if (error) {
      console.error("Erreur lors de la recherche du client:", error);
      return null;
    }

    console.log("Client trouvé:", data);
    return data;
  };

  const confirmEdit = async () => {
    if (!selectedTransfer) return;

    try {
      const { error } = await supabase
        .from('transfers')
        .update({
          from_client: editForm.fromClient,
          to_client: editForm.toClient,
          amount: parseFloat(editForm.amount),
          reason: editForm.reason
        })
        .eq('id', selectedTransfer.id);

      if (error) {
        console.error("Erreur lors de la modification du virement:", error);
        toast.error("Erreur lors de la modification du virement");
        return;
      }

      setIsEditDialogOpen(false);
      toast.success("Virement modifié avec succès");
      onSuccess();
    } catch (error) {
      console.error("Erreur dans confirmEdit:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const confirmDelete = async () => {
    if (!selectedTransfer) return;

    try {
      console.log("Début de la suppression du virement:", selectedTransfer);

      const fromClient = await findClientByFullName(selectedTransfer.fromClient);
      const toClient = await findClientByFullName(selectedTransfer.toClient);

      if (!fromClient || !toClient) {
        console.error("Impossible de trouver un ou plusieurs clients");
        toast.error("Impossible de trouver un ou plusieurs clients");
        return;
      }

      console.log("Clients trouvés - De:", fromClient.id, "À:", toClient.id);

      const { error: deleteError } = await supabase
        .from('transfers')
        .delete()
        .eq('id', selectedTransfer.id);

      if (deleteError) {
        console.error("Erreur lors de la suppression du virement:", deleteError);
        toast.error("Erreur lors de la suppression du virement");
        return;
      }

      console.log("Virement supprimé, mise à jour des soldes...");

      // Mise à jour des soldes avec un délai pour laisser le temps aux triggers de s'exécuter
      setTimeout(async () => {
        await Promise.all([
          refreshClientBalance(fromClient.id),
          refreshClientBalance(toClient.id)
        ]);

        await fetchClients();
        console.log("Soldes mis à jour");
      }, 1000);

      setIsDeleteDialogOpen(false);
      toast.success("Virement supprimé avec succès");
      onSuccess();
    } catch (error) {
      console.error("Erreur dans confirmDelete:", error);
      toast.error("Une erreur est survenue");
    }
  };

  return {
    selectedTransfer,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editForm,
    setEditForm,
    handleEdit,
    handleDelete,
    confirmEdit,
    confirmDelete
  };
};
