
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
  const refreshTriggerRef = useRef(0);
  const deleteAttemptsRef = useRef(0);

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
    // Faire une copie complète pour éviter les problèmes de référence
    setOperationToDelete(JSON.parse(JSON.stringify(operation)));
    setShowDeleteDialog(true);
  }, []);

  // Fonction pour parser l'ID d'une opération en fonction de son format
  const parseOperationId = (operation: Operation): number => {
    // Vérifier que l'opération existe
    if (!operation || !operation.id) {
      throw new Error("Opération ou ID invalide");
    }
    
    // Convertir l'ID en chaîne pour le traitement
    const idString = String(operation.id);
    console.log(`Parsing operation ID: ${idString}, type: ${typeof idString}`);
    
    // Pour les IDs de format "withdrawal-123" ou "wit-123"
    if (idString.includes('-')) {
      const parts = idString.split('-');
      const idPart = parts[parts.length - 1];
      console.log(`ID après split: ${idPart}`);
      
      const numericId = parseInt(idPart, 10);
      
      if (isNaN(numericId)) {
        console.error(`Impossible de convertir l'ID en nombre: ${idPart}`);
        throw new Error(`Format d'ID invalide: ${idString}`);
      }
      
      console.log(`ID numérique extrait: ${numericId}`);
      return numericId;
    } 
    // Pour les IDs de format "wit123" (sans tiret)
    else if (idString.match(/^[a-z]+\d+$/i)) {
      // Suppression de tous les caractères non-numériques
      const idPart = idString.replace(/\D/g, '');
      console.log(`ID après extraction numérique: ${idPart}`);
      
      const numericId = parseInt(idPart, 10);
      
      if (isNaN(numericId)) {
        console.error(`Impossible de convertir l'ID en nombre: ${idPart}`);
        throw new Error(`Format d'ID invalide: ${idString}`);
      }
      
      console.log(`ID numérique extrait: ${numericId}`);
      return numericId;
    } 
    // Pour les IDs purement numériques
    else {
      const numericId = parseInt(idString, 10);
      
      if (isNaN(numericId)) {
        console.error(`Impossible de convertir l'ID en nombre: ${idString}`);
        throw new Error(`Format d'ID invalide: ${idString}`);
      }
      
      console.log(`ID numérique extrait: ${numericId}`);
      return numericId;
    }
  };

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
      const operationType = opToDelete.type;
      
      // Utiliser la fonction parseOperationId pour extraire l'ID numérique
      let operationId: number;
      try {
        operationId = parseOperationId(opToDelete);
      } catch (error) {
        console.error("Erreur lors du parsing de l'ID:", error);
        toast.error("Format d'ID invalide");
        return false;
      }
      
      console.log("ID d'opération parsé:", operationId);
      
      // Incrémenter le compteur de tentatives
      deleteAttemptsRef.current += 1;
      console.log(`Tentative de suppression #${deleteAttemptsRef.current}`);
      
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
        
        // Si c'est une erreur critique mais qu'on n'a pas encore fait beaucoup de tentatives, 
        // on peut réessayer automatiquement
        if (deleteAttemptsRef.current < 3) {
          console.log(`Réessai automatique #${deleteAttemptsRef.current}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return confirmDeleteOperation(operation);
        }
        
        return false;
      }
      
      console.log("Suppression réussie. Nettoyage de l'état local.");
      if (isMounted.current) {
        setShowDeleteDialog(false);
        setOperationToDelete(null);
      }
      
      // Réinitialiser le compteur de tentatives
      deleteAttemptsRef.current = 0;
      
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
  }, [operationToDelete, refreshOperations, delayedRefresh]);

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
    isProcessing,
    delayedRefresh
  };
};
