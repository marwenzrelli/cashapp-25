
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

  // Initialize operations on component mount
  useEffect(() => {
    fetchAllOperations();
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
