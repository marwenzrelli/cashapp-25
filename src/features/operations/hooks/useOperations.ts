
import { useEffect, useState, useCallback } from "react";
import { Operation } from "../types";
import { useOperationsState } from "./useOperationsState";
import { useFetchOperations } from "./useFetchOperations";
import { useDeleteOperation } from "./useDeleteOperation";
import { useOperationsRealtime } from "./useOperationsRealtime";
import { useOperationsRefresh } from "./useOperationsRefresh";

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
  const { cleanupRealtime, setupRealtimeSubscription } = useOperationsRealtime(refreshOperations);
  const { refreshOperationsWithFeedback } = useOperationsRefresh(refreshOperations, setIsLoading);
  
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [loadRetryCount, setLoadRetryCount] = useState(0);

  // Update local operations when fetchedOperations change
  useEffect(() => {
    if (fetchedOperations.length > 0) {
      console.log(`useOperations: Updating operations state with ${fetchedOperations.length} operations`);
      setOperations(fetchedOperations);
      
      if (!initialLoadDone) {
        setInitialLoadDone(true);
      }
    } else if (!fetchLoading && initialLoadDone) {
      // If loading is complete but no operations were found, make sure to update state
      console.log("useOperations: No operations found after loading completed");
      setOperations([]);
    }
  }, [fetchedOperations, fetchLoading, initialLoadDone, setOperations]);

  // Ensure initial load completes and retry if needed
  useEffect(() => {
    if (!initialLoadDone && !fetchLoading && fetchedOperations.length === 0 && loadRetryCount < 3) {
      // If we finished loading but have no operations, let's try one more time
      const timer = setTimeout(() => {
        console.log(`useOperations: No operations found after initial load, retrying (${loadRetryCount + 1}/3)`);
        setLoadRetryCount(prev => prev + 1);
        refreshOperations(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [initialLoadDone, fetchLoading, fetchedOperations.length, refreshOperations, loadRetryCount]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log("useOperations: Cleaning up on unmount");
      cleanupRealtime();
    };
  }, [cleanupRealtime]);

  // Retry setup realtime subscription if it fails
  useEffect(() => {
    if (!initialLoadDone) return;
    
    // Setup realtime subscription when initial data is loaded
    console.log("Setting up realtime subscription after initial data load");
    setupRealtimeSubscription();
  }, [initialLoadDone, setupRealtimeSubscription]);

  // Wrapper for delete operation to update state
  const deleteOperation = useCallback(async (operation: Operation) => {
    setOperationToDelete(operation);
    setShowDeleteDialog(true);
  }, [setOperationToDelete, setShowDeleteDialog]);

  // Wrapper for confirm delete to pass the current operation to delete
  const confirmDeleteOperation = useCallback(async () => {
    if (!operationToDelete) {
      console.error("No operation to delete");
      return false;
    }
    return await confirmDeleteOperationLogic(operationToDelete);
  }, [operationToDelete, confirmDeleteOperationLogic]);

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
