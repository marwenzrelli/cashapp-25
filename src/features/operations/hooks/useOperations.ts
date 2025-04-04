
import { useEffect, useCallback } from "react";
import { Operation } from "../types";
import { useOperationsState } from "./useOperationsState";
import { useFetchOperations } from "./useFetchOperations";
import { useDeleteOperation } from "./useDeleteOperation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useOperations = () => {
  const {
    operations,
    setOperations,
    isLoading,
    setIsLoading,
    operationToDelete,
    setOperationToDelete,
    showDeleteDialog,
    setShowDeleteDialog
  } = useOperationsState();

  // Use fetchOperations instead of fetchAllOperations
  const { operations: fetchedOperations, isLoading: fetchLoading, error: fetchError, refreshOperations } = useFetchOperations();
  const { deleteOperation: deleteOperationLogic, confirmDeleteOperation: confirmDeleteOperationLogic } = useDeleteOperation(refreshOperations, setIsLoading);

  // Update local operations when fetchedOperations change
  useEffect(() => {
    setOperations(fetchedOperations);
  }, [fetchedOperations, setOperations]);

  // Fonction pour dédupliquer des opérations basées sur leur ID
  const deduplicateOperations = (ops: Operation[]): Operation[] => {
    const uniqueOps = new Map<string, Operation>();
    
    for (const op of ops) {
      const uniqueId = op.id.toString();
      if (!uniqueOps.has(uniqueId)) {
        uniqueOps.set(uniqueId, op);
      }
    }
    
    return Array.from(uniqueOps.values());
  };

  // Initialize operations on component mount
  useEffect(() => {
    const initOperations = async () => {
      await refreshOperations();
      
      // Dédupliquer les opérations après les avoir récupérées
      if (operations.length > 0) {
        const uniqueOperations = deduplicateOperations(operations);
        if (uniqueOperations.length !== operations.length) {
          console.log(`Dédupliqué ${operations.length - uniqueOperations.length} opérations`);
          setOperations(uniqueOperations);
        }
      }
    };
    
    initOperations();
  }, []);

  // Set up real-time subscription to operations
  useEffect(() => {
    const channel = supabase
      .channel('operations-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'deposits'
      }, () => {
        console.log('Deposit change detected, refreshing operations');
        refreshOperations();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'withdrawals'
      }, () => {
        console.log('Withdrawal change detected, refreshing operations');
        refreshOperations();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transfers'
      }, () => {
        console.log('Transfer change detected, refreshing operations');
        refreshOperations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshOperations]);

  // Wrapper for delete operation to update state
  const deleteOperation = async (operation: Operation) => {
    setOperationToDelete(operation);
    setShowDeleteDialog(true);
  };

  // Wrapper for confirm delete to pass the current operation to delete
  const confirmDeleteOperation = async () => {
    await confirmDeleteOperationLogic(operationToDelete);
  };

  // Function to refresh operations with UI feedback
  const refreshOperationsWithFeedback = async () => {
    try {
      setIsLoading(true);
      await refreshOperations();
      
      // Dédupliquer les opérations après rafraîchissement
      if (operations.length > 0) {
        const uniqueOperations = deduplicateOperations(operations);
        if (uniqueOperations.length !== operations.length) {
          console.log(`Dédupliqué ${operations.length - uniqueOperations.length} opérations au rafraîchissement`);
          setOperations(uniqueOperations);
        }
      }
      
      toast.success("Opérations actualisées");
    } catch (error) {
      console.error("Erreur lors de l'actualisation des opérations:", error);
      toast.error("Erreur lors de l'actualisation des opérations");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    operations,
    isLoading: isLoading || fetchLoading,
    error: fetchError,
    fetchOperations: refreshOperations,
    refreshOperations: refreshOperationsWithFeedback,
    deleteOperation,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteOperation,
    operationToDelete
  };
};
