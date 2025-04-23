
import { useState, useCallback, useRef } from "react";
import { Operation } from "../types";
import { useFetchOperations } from "./useFetchOperations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useOperations = () => {
  // État local
  const [operationToDelete, setOperationToDelete] = useState<Operation | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Récupération des données
  const { operations, isLoading, error, refreshOperations } = useFetchOperations();

  // Référence pour savoir si le composant est monté
  const isMounted = useRef(true);
  
  // Nettoyage
  const cleanupOnUnmount = useCallback(() => {
    isMounted.current = false;
  }, []);

  // Supprimer une opération
  const deleteOperation = useCallback((operation: Operation) => {
    setOperationToDelete(operation);
    setShowDeleteDialog(true);
  }, []);

  // Confirmer la suppression
  const confirmDeleteOperation = useCallback(async (operation?: Operation): Promise<boolean> => {
    const opToDelete = operation || operationToDelete;
    if (!opToDelete) return false;
    
    setIsProcessing(true);
    
    try {
      const operationType = opToDelete.type;
      const operationIdString = opToDelete.id.toString().split('-')[1]; // Extraire l'ID numérique sous forme de string
      
      // Convertir l'ID en nombre
      const operationId = parseInt(operationIdString, 10);
      
      // Vérifier si la conversion a réussi
      if (isNaN(operationId)) {
        console.error("ID d'opération invalide:", operationIdString);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      let error = null;
      
      // Suppression en fonction du type d'opération
      if (operationType === 'deposit') {
        const { error: deleteError } = await supabase
          .from('deposits')
          .delete()
          .eq('id', operationId); // Utiliser l'ID converti en nombre
        error = deleteError;
      } else if (operationType === 'withdrawal') {
        const { error: deleteError } = await supabase
          .from('withdrawals')
          .delete()
          .eq('id', operationId); // Utiliser l'ID converti en nombre
        error = deleteError;
      } else if (operationType === 'transfer') {
        const { error: deleteError } = await supabase
          .from('transfers')
          .delete()
          .eq('id', operationId); // Utiliser l'ID converti en nombre
        error = deleteError;
      }
      
      if (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression");
        return false;
      }
      
      // On rafraîchit après suppression - forcer le rafraîchissement complet
      setShowDeleteDialog(false);
      setOperationToDelete(undefined);
      
      console.log("Suppression réussie, rafraîchissement des données...");
      
      // Attendre un court instant pour s'assurer que la suppression est terminée côté serveur
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Forcer un rafraîchissement complet des données
      await refreshOperations(true);
      
      console.log("Rafraîchissement des données terminé après suppression");
      
      // Notifier l'utilisateur du succès de l'opération
      toast.success("Opération supprimée avec succès");
      
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      toast.error("Erreur lors de la suppression");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [operationToDelete, refreshOperations]);

  return {
    operations,
    isLoading: isLoading || isProcessing,
    error,
    refreshOperations,
    deleteOperation,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteOperation,
    operationToDelete
  };
};
