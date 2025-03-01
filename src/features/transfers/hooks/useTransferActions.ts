
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
    
    try {
      // Méthode 1: Recherche exacte du nom complet comme concaténation de prénom et nom
      const [prenom, ...nomParts] = fullName.split(' ');
      const nom = nomParts.join(' ');
      
      // Vérifier si les deux parties sont présentes
      if (prenom && nom) {
        const { data: exactMatch, error: exactError } = await supabase
          .from('clients')
          .select('id')
          .eq('prenom', prenom)
          .eq('nom', nom)
          .single();
          
        if (!exactError && exactMatch) {
          console.log("Client trouvé avec correspondance exacte:", exactMatch);
          return exactMatch;
        }
      }
      
      // Méthode 2: Recherche par nom complet dans les deux champs
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, prenom, nom');
      
      if (clientsError) {
        console.error("Erreur lors de la recherche des clients:", clientsError);
        return null;
      }
      
      // Recherche du client qui correspond le mieux au nom complet
      const matchedClient = clients.find(client => {
        const clientFullName = `${client.prenom} ${client.nom}`.trim();
        return clientFullName === fullName.trim();
      });
      
      if (matchedClient) {
        console.log("Client trouvé par nom complet:", matchedClient);
        return matchedClient;
      }
      
      // Méthode 3: Recherche partielle pour les cas où le format pourrait être différent
      console.log("Tentative de recherche partielle...");
      const normalizedFullName = fullName.toLowerCase().trim();
      
      const partialMatch = clients.find(client => {
        const clientFullName = `${client.prenom} ${client.nom}`.toLowerCase().trim();
        return clientFullName.includes(normalizedFullName) || normalizedFullName.includes(clientFullName);
      });
      
      if (partialMatch) {
        console.log("Client trouvé par correspondance partielle:", partialMatch);
        return partialMatch;
      }
      
      console.log("Aucun client correspondant trouvé pour:", fullName);
      return null;
    } catch (error) {
      console.error("Erreur lors de la recherche du client:", error);
      return null;
    }
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
        console.log("Client expéditeur recherché:", selectedTransfer.fromClient);
        console.log("Client destinataire recherché:", selectedTransfer.toClient);
        
        // Continuer avec la suppression même si les clients ne sont pas trouvés
        const { error: deleteError } = await supabase
          .from('transfers')
          .delete()
          .eq('id', selectedTransfer.id);

        if (deleteError) {
          console.error("Erreur lors de la suppression du virement:", deleteError);
          toast.error("Erreur lors de la suppression du virement");
          return;
        }
        
        toast.success("Virement supprimé avec succès");
        setIsDeleteDialogOpen(false);
        onSuccess();
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
