
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
  const confirmDeleteOperation = useCallback(async () => {
    if (!operationToDelete) return false;
    
    setIsProcessing(true);
    
    try {
      const operationType = operationToDelete.type;
      const operationId = operationToDelete.id.split('-')[1]; // Extraire l'ID numérique
      
      let error = null;
      
      // Suppression en fonction du type d'opération
      if (operationType === 'deposit') {
        const { error: deleteError } = await supabase
          .from('deposits')
          .delete()
          .eq('id', operationId);
        error = deleteError;
      } else if (operationType === 'withdrawal') {
        const { error: deleteError } = await supabase
          .from('withdrawals')
          .delete()
          .eq('id', operationId);
        error = deleteError;
      } else if (operationType === 'transfer') {
        const { error: deleteError } = await supabase
          .from('transfers')
          .delete()
          .eq('id', operationId);
        error = deleteError;
      }
      
      if (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression");
        return false;
      }
      
      toast.success("Opération supprimée avec succès");
      
      // On rafraîchit après suppression 
      setShowDeleteDialog(false);
      setOperationToDelete(undefined);
      refreshOperations(true);
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
