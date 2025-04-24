
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
      
      // Extraire correctement l'ID numérique, peu importe le format
      let operationId: number;
      const idString = String(opToDelete.id);
      
      // Format commun possible: "deposit-123", "wit-123" ou simplement "123"
      if (idString.includes('-')) {
        const parts = idString.split('-');
        const idPart = parts[parts.length - 1];
        operationId = parseInt(idPart, 10);
      } else if (idString.startsWith('wit')) { 
        // Format spécial pour les retraits de pepsi men (peut-être "wit123")
        const idPart = idString.replace(/\D/g, ''); // Supprimer tous les caractères non numériques
        operationId = parseInt(idPart, 10);
      } else {
        // Si c'est déjà un nombre sans préfixe
        operationId = parseInt(idString, 10);
      }
      
      // Vérifier si la conversion a réussi
      if (isNaN(operationId)) {
        console.error("ID d'opération invalide après traitement:", idString, "=>", operationId);
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Forcer un rafraîchissement des opérations avec force=true
      await refreshOperations(true);
      
      // Second refresh après un délai plus long pour s'assurer que les données sont à jour
      setTimeout(() => {
        console.log("Second rafraîchissement forcé après suppression");
        refreshOperations(true);
      }, 3000);
      
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
