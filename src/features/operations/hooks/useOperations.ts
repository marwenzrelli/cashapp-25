
import { useEffect, useState } from "react";
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
  const { cleanupRealtime } = useOperationsRealtime(refreshOperations);
  const { refreshOperationsWithFeedback } = useOperationsRefresh(refreshOperations, setIsLoading);
  
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Update local operations when fetchedOperations change
  useEffect(() => {
    if (fetchedOperations.length > 0) {
      console.log(`Updating operations state with ${fetchedOperations.length} operations`);
      setOperations(fetchedOperations);
      
      if (!initialLoadDone) {
        setInitialLoadDone(true);
      }
    } else if (!fetchLoading && initialLoadDone) {
      // If loading is complete but no operations were found, make sure to update state
      console.log("No operations found after loading completed");
      setOperations([]);
    }
  }, [fetchedOperations, fetchLoading, initialLoadDone, setOperations]);

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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupRealtime();
    };
  }, [cleanupRealtime]);

  // Wrapper for delete operation to update state
  const deleteOperation = async (operation: Operation) => {
    setOperationToDelete(operation);
    setShowDeleteDialog(true);
  };

  // Wrapper for confirm delete to pass the current operation to delete
  const confirmDeleteOperation = async () => {
    if (!operationToDelete) {
      console.error("No operation to delete");
      return false;
    }
    return await confirmDeleteOperationLogic(operationToDelete);
  };

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
