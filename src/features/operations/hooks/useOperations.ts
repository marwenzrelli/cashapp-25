import { useEffect, useState, useCallback, useRef } from "react";
import { Operation } from "../types";
import { useOperationsState } from "./useOperationsState";
import { useFetchOperations } from "./useFetchOperations";
import { useDeleteOperation } from "./useDeleteOperation";
import { useOperationsRealtime } from "./useOperationsRealtime";
import { useOperationsRefresh } from "./useOperationsRefresh";

export const useOperations = () => {
  const isMountedRef = useRef(true);

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
  
  const refreshOps = useCallback((force: boolean = false): Promise<void> => {
    return refreshOperations(force);
  }, [refreshOperations]);
  
  const { deleteOperation: deleteOperationLogic, confirmDeleteOperation: confirmDeleteOperationLogic } = useDeleteOperation(refreshOps, setIsLoading);
  const { cleanupRealtime, setupRealtimeSubscription } = useOperationsRealtime(refreshOps);
  const { refreshOperationsWithFeedback } = useOperationsRefresh(refreshOps, setIsLoading);
  
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [loadRetryCount, setLoadRetryCount] = useState(0);

  useEffect(() => {
    if (!isMountedRef.current) return;

    if (fetchedOperations.length > 0) {
      console.log(`useOperations: Updating operations state with ${fetchedOperations.length} operations`);
      setOperations(fetchedOperations);
      
      if (!initialLoadDone) {
        setInitialLoadDone(true);
      }
    } else if (!fetchLoading && initialLoadDone) {
      console.log("useOperations: No operations found after loading completed");
      setOperations([]);
    }
  }, [fetchedOperations, fetchLoading, initialLoadDone, setOperations]);

  useEffect(() => {
    if (!isMountedRef.current) return;

    if (!initialLoadDone && !fetchLoading && fetchedOperations.length === 0 && loadRetryCount < 3) {
      const timer = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        console.log(`useOperations: No operations found after initial load, retrying (${loadRetryCount + 1}/3)`);
        setLoadRetryCount(prev => prev + 1);
        refreshOps(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [initialLoadDone, fetchLoading, fetchedOperations.length, refreshOps, loadRetryCount]);

  useEffect(() => {
    return () => {
      console.log("useOperations: Cleaning up on unmount");
      isMountedRef.current = false;
      cleanupRealtime();
    };
  }, [cleanupRealtime]);

  useEffect(() => {
    if (!initialLoadDone || !isMountedRef.current) return;
    
    console.log("Setting up realtime subscription after initial data load");
    setupRealtimeSubscription();
  }, [initialLoadDone, setupRealtimeSubscription]);

  const deleteOperation = useCallback(async (operation: Operation) => {
    if (!isMountedRef.current) return;
    setOperationToDelete(operation);
    setShowDeleteDialog(true);
  }, [setOperationToDelete, setShowDeleteDialog]);

  const confirmDeleteOperation = useCallback(async () => {
    if (!isMountedRef.current) return false;
    
    if (!operationToDelete) {
      console.error("No operation to delete");
      return false;
    }
    return await confirmDeleteOperationLogic(operationToDelete);
  }, [operationToDelete, confirmDeleteOperationLogic]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    operations,
    isLoading: isLoading || fetchLoading,
    error: fetchError || null,
    fetchOperations: refreshOps,
    refreshOperations: refreshOperationsWithFeedback,
    deleteOperation,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteOperation,
    operationToDelete
  };
};
