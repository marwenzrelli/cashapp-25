
import { useState, useCallback, useRef } from "react";
import { Operation } from "../types";
import { useFetchOperations } from "./useFetchOperations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useOperations = () => {
  // État local
  const [operationToDelete, setOperationToDelete] = useState<Operation | null>(null);
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
    console.log("deleteOperation appelé avec", operation);
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
      
      // Utiliser String() pour une conversion sécurisée en string
      const operationIdString = String(opToDelete.id);
      
      // Extraire l'ID numérique - s'assurer de traiter correctement les formats "type-id"
      let operationId: number;
      
      if (operationIdString.includes('-')) {
        const parts = operationIdString.split('-');
        if (parts.length > 1) {
          operationId = parseInt(parts[1], 10);
        } else {
          throw new Error("Format d'ID invalide");
        }
      } else {
        // Si c'est déjà un nombre sans préfixe
        operationId = parseInt(operationIdString, 10);
      }
      
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
      if (isMounted.current) {
        setShowDeleteDialog(false);
        setOperationToDelete(null);
      }
      
      // Attendre que la base de données traite la suppression
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Forcer un rafraîchissement des opérations avec force=true
      await refreshOperations(true);
      
      // Second refresh après un court délai (pour s'assurer que les données sont à jour)
      setTimeout(() => {
        refreshOperations(true);
      }, 1500);
      
      toast.success("Opération supprimée avec succès");
      return success;
    } catch (err) {
      console.error("Erreur durant la suppression:", err);
      toast.error("Erreur lors de la suppression");
      return false;
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
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
    operationToDelete,
    isProcessing
  };
};
