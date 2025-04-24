
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
    if (!opToDelete) {
      console.error("Aucune opération sélectionnée pour la suppression");
      toast.error("Aucune opération sélectionnée");
      return false;
    }
    
    setIsProcessing(true);
    console.log("Début de la suppression pour l'opération:", opToDelete.id, "type:", opToDelete.type);
    
    try {
      const operationType = opToDelete.type;
      // Extraire l'ID numérique de l'opération de façon sécurisée
      const operationIdString = String(opToDelete.id); // Conversion sécurisée en string
      
      // Analyser l'ID - vérifier s'il contient un tiret et extraire la partie numérique si nécessaire
      const idParts = operationIdString.split('-');
      const operationId = parseInt(idParts.length > 1 ? idParts[1] : operationIdString, 10);
      
      // Vérifier si la conversion a réussi
      if (isNaN(operationId)) {
        console.error("ID d'opération invalide:", operationIdString);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      console.log("ID d'opération parsé:", operationId);
      
      let error = null;
      let success = false;
      
      // Suppression selon le type d'opération
      switch (operationType) {
        case 'deposit':
          console.log("Suppression d'un dépôt avec ID:", operationId);
          const { error: depositError } = await supabase
            .from('deposits')
            .delete()
            .eq('id', operationId);
          error = depositError;
          success = !depositError;
          break;
          
        case 'withdrawal':
          console.log("Suppression d'un retrait avec ID:", operationId);
          const { error: withdrawalError } = await supabase
            .from('withdrawals')
            .delete()
            .eq('id', operationId);
          error = withdrawalError;
          success = !withdrawalError;
          break;
          
        case 'transfer':
          console.log("Suppression d'un transfert avec ID:", operationId);
          const { error: transferError } = await supabase
            .from('transfers')
            .delete()
            .eq('id', operationId);
          error = transferError;
          success = !transferError;
          break;
          
        default:
          console.error("Type d'opération inconnu:", operationType);
          toast.error("Type d'opération invalide");
          return false;
      }
      
      if (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression", {
          description: error.message
        });
        return false;
      }
      
      console.log("Suppression réussie. Nettoyage de l'état local.");
      setShowDeleteDialog(false);
      setOperationToDelete(undefined);
      
      // Attendre brièvement que la base de données traite la suppression
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return success;
    } catch (err) {
      console.error("Erreur durant la suppression:", err);
      toast.error("Erreur lors de la suppression");
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [operationToDelete]);

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
