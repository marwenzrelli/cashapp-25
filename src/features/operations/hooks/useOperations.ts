
import { useState, useCallback, useRef } from "react";
import { Operation } from "../types";
import { useFetchOperations } from "./useFetchOperations";
import { toast } from "sonner";
import { deleteOperation } from "../utils/deletionUtils";

export const useOperations = () => {
  // État local
  const [operationToDelete, setOperationToDelete] = useState<Operation | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const refreshTriggerRef = useRef(0);

  // Récupération des données
  const { operations, isLoading, error, refreshOperations } = useFetchOperations();

  // Référence pour savoir si le composant est monté
  const isMounted = useRef(true);
  
  // Nettoyage
  const cleanupOnUnmount = useCallback(() => {
    isMounted.current = false;
  }, []);

  // Préparer la suppression d'une opération
  const handleDeleteOperation = useCallback((operation: Operation) => {
    console.log("handleDeleteOperation appelé avec", operation);
    // Faire une copie complète pour éviter les problèmes de référence
    setOperationToDelete(JSON.parse(JSON.stringify(operation)));
    setShowDeleteDialog(true);
  }, []);

  // Petit délai avant de rafraîchir les données
  const delayedRefresh = useCallback(async (delay: number = 2000, force: boolean = true) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return refreshOperations(force);
  }, [refreshOperations]);

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
    console.log("Contenu complet de l'opération:", JSON.stringify(opToDelete));
    
    try {
      // Utiliser la nouvelle fonction centralisée de suppression
      const success = await deleteOperation(opToDelete);
      
      if (success) {
        console.log("Suppression réussie. Nettoyage de l'état local.");
        if (isMounted.current) {
          setShowDeleteDialog(false);
          setOperationToDelete(null);
        }
        
        // Attendre que la base de données traite la suppression
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Incrémenter le compteur de rafraîchissement
        refreshTriggerRef.current += 1;
        
        // Séquence de rafraîchissements avec délais croissants
        try {
          console.log(`Premier rafraîchissement après suppression (#${refreshTriggerRef.current})`);
          await refreshOperations(true);
          
          console.log(`Second rafraîchissement après 3s (#${refreshTriggerRef.current})`);
          await delayedRefresh(3000);
          
          console.log(`Troisième rafraîchissement après 6s (#${refreshTriggerRef.current})`);
          await delayedRefresh(6000);
        } catch (refreshError) {
          console.error("Erreur pendant le rafraîchissement:", refreshError);
        }
      }
      
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
  }, [operationToDelete, refreshOperations, delayedRefresh]);

  return {
    operations,
    isLoading: isLoading || isProcessing,
    error,
    refreshOperations,
    deleteOperation: handleDeleteOperation,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteOperation,
    operationToDelete,
    isProcessing,
    delayedRefresh
  };
};
