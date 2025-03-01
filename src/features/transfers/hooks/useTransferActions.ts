
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

      // Récupérer la session utilisateur pour tracer qui supprime le virement
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      console.log("Session utilisateur:", session);
      console.log("User ID pour la suppression:", userId);
      
      // Récupérer les détails complets du virement avant suppression
      const { data: transferData, error: fetchError } = await supabase
        .from('transfers')
        .select('*')
        .eq('id', selectedTransfer.id)
        .single();
        
      if (fetchError) {
        console.error("Erreur lors de la récupération des détails du virement:", fetchError);
        toast.error("Erreur lors de la récupération des détails du virement", {
          description: fetchError.message
        });
        throw fetchError;
      }
      
      if (!transferData) {
        console.error("Aucune donnée de virement trouvée pour l'ID:", selectedTransfer.id);
        toast.error("Virement introuvable", {
          description: "Impossible de trouver les détails du virement à supprimer."
        });
        throw new Error("Virement introuvable");
      }
      
      console.log("Récupération des détails du virement réussie:", transferData);
      
      // Préparer les données à insérer dans deleted_transfers
      const logEntry = {
        original_id: transferData.id,
        from_client: transferData.from_client,
        to_client: transferData.to_client,
        amount: Number(transferData.amount),
        operation_date: transferData.operation_date || transferData.created_at,
        reason: transferData.reason || null,
        deleted_by: userId || null,
        status: transferData.status
      };

      console.log("Données à insérer dans deleted_transfers:", JSON.stringify(logEntry));
      
      // Insérer dans la table des virements supprimés
      const { data: logData, error: logError } = await supabase
        .from('deleted_transfers')
        .insert(logEntry);
        
      if (logError) {
        console.error("Erreur lors de l'enregistrement dans deleted_transfers:", logError);
        console.error("Détails de l'erreur:", logError.message, logError.details, logError.hint);
        console.error("Code de l'erreur:", logError.code);
        throw logError;
      } 
      
      console.log("Virement enregistré avec succès dans deleted_transfers");

      // Rechercher les IDs des clients pour mettre à jour les soldes après suppression
      const fromClient = await findClientByFullName(selectedTransfer.fromClient);
      const toClient = await findClientByFullName(selectedTransfer.toClient);
      
      // Suppression du virement original
      const { error: deleteError } = await supabase
        .from('transfers')
        .delete()
        .eq('id', selectedTransfer.id);

      if (deleteError) {
        console.error("Erreur lors de la suppression du virement:", deleteError);
        toast.error("Erreur lors de la suppression du virement");
        return;
      }

      // Mise à jour des soldes si les clients ont été trouvés
      if (fromClient && toClient) {
        console.log("Clients trouvés - De:", fromClient.id, "À:", toClient.id);

        // Mise à jour des soldes avec un délai pour laisser le temps aux triggers de s'exécuter
        setTimeout(async () => {
          await Promise.all([
            refreshClientBalance(fromClient.id),
            refreshClientBalance(toClient.id)
          ]);

          await fetchClients();
          console.log("Soldes mis à jour");
        }, 1000);
      }

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
