
import { useEffect, useCallback, useState, useRef } from "react";
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

  const { operations: fetchedOperations, isLoading: fetchLoading, error: fetchError, refreshOperations } = useFetchOperations();
  const { deleteOperation: deleteOperationLogic, confirmDeleteOperation: confirmDeleteOperationLogic } = useDeleteOperation(refreshOperations, setIsLoading);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const realtimeSubscribedRef = useRef(false);

  // Update local operations when fetchedOperations change
  useEffect(() => {
    if (fetchedOperations.length > 0) {
      console.log(`Updating operations state with ${fetchedOperations.length} operations`);
      setOperations(fetchedOperations);
      
      if (!initialLoadDone) {
        setInitialLoadDone(true);
      }
    } else if (!fetchLoading && initialLoadDone) {
      // Si le chargement est terminé mais qu'aucune opération n'a été trouvée
      console.log("No operations found after loading completed");
    }
  }, [fetchedOperations, fetchLoading, initialLoadDone, setOperations]);

  // Fonction pour dédupliquer des opérations basées sur leur ID
  const deduplicateOperations = (ops: Operation[]): Operation[] => {
    const uniqueOps = new Map<string, Operation>();
    
    for (const op of ops) {
      const uniqueId = `${op.type}-${op.id}`;
      if (!uniqueOps.has(uniqueId)) {
        uniqueOps.set(uniqueId, op);
      }
    }
    
    return Array.from(uniqueOps.values());
  };

  // Ensure initial load completes
  useEffect(() => {
    if (!initialLoadDone && !fetchLoading && fetchedOperations.length === 0) {
      // If we finished loading but have no operations, let's try one more time
      const timer = setTimeout(() => {
        console.log("No operations found after initial load, trying one more time");
        refreshOperations(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [initialLoadDone, fetchLoading, fetchedOperations.length, refreshOperations]);

  // Set up real-time subscription to operations
  useEffect(() => {
    if (realtimeSubscribedRef.current) return;
    
    realtimeSubscribedRef.current = true;
    console.log("Setting up realtime subscription for operations");
    
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
      .subscribe((status) => {
        console.log(`Realtime subscription status: ${status}`);
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
      realtimeSubscribedRef.current = false;
    };
  }, [refreshOperations]);

  // Wrapper for delete operation to update state
  const deleteOperation = async (operation: Operation) => {
    setOperationToDelete(operation);
    setShowDeleteDialog(true);
  };

  // Wrapper for confirm delete to pass the current operation to delete
  const confirmDeleteOperation = async () => {
    if (!operationToDelete) {
      console.error("No operation to delete");
      return;
    }
    await confirmDeleteOperationLogic(operationToDelete);
  };

  // Function to refresh operations with UI feedback
  const refreshOperationsWithFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      await refreshOperations(true);
      
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
  }, [operations, refreshOperations, setIsLoading, setOperations]);

  // Check if we're in a stalled loading state
  useEffect(() => {
    let loadingTimer: NodeJS.Timeout;
    
    if (isLoading || fetchLoading) {
      loadingTimer = setTimeout(() => {
        if (isLoading || fetchLoading) {
          console.log("Loading operations is taking too long, attempting to recover");
          setIsLoading(false);
          refreshOperations(true);
        }
      }, 10000); // If loading for more than 10 seconds, try to recover
    }
    
    return () => {
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [isLoading, fetchLoading, refreshOperations, setIsLoading]);

  return {
    operations,
    isLoading: isLoading || fetchLoading,
    error: fetchError || dataError,
    fetchOperations: refreshOperations,
    refreshOperations: refreshOperationsWithFeedback,
    deleteOperation,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteOperation,
    operationToDelete
  };
};
