
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

  const { fetchAllOperations } = useFetchOperations(setOperations, setIsLoading);
  const { deleteOperation: deleteOperationLogic, confirmDeleteOperation: confirmDeleteOperationLogic } = useDeleteOperation(fetchAllOperations, setIsLoading);

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
      await fetchAllOperations();
      
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
        fetchAllOperations();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'withdrawals'
      }, () => {
        console.log('Withdrawal change detected, refreshing operations');
        fetchAllOperations();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transfers'
      }, () => {
        console.log('Transfer change detected, refreshing operations');
        fetchAllOperations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllOperations]);

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
  const refreshOperations = async () => {
    try {
      setIsLoading(true);
      await fetchAllOperations();
      
      // Dédupliquer les opérations après rafraîchissement
      if (operations.length > 0) {
        const uniqueOperations = deduplicateOperations(operations);
        if (uniqueOperations.length !== operations.length) {
          console.log(`Dédupliqué ${operations.length - uniqueOperations.length} opérations au rafraîchissement`);
          setOperations(uniqueOperations);
        }
      }
      
      // Debug log for operations with IDs 72-78
      const specificIds = [72, 73, 74, 75, 76, 77, 78];
      const foundSpecific = operations.filter(op => {
        const numId = typeof op.id === 'string' ? 
          parseInt(op.id.split('-')[1] || '0') : op.id;
        return specificIds.includes(numId);
      });
      
      console.log(`Operations refresh - Found ${foundSpecific.length} operations with IDs 72-78:`,
                 foundSpecific.map(op => op.id).join(', '));
      
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
    isLoading,
    fetchOperations: fetchAllOperations,
    refreshOperations,
    deleteOperation,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteOperation,
    operationToDelete
  };
};
