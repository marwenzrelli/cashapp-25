
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "@/features/operations/types";
import { transformToOperations, deduplicateOperations, sortOperationsByDate } from "./utils/operationTransformers";
import { toast } from "sonner";

export const useOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationToDelete, setOperationToDelete] = useState<Operation | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchOperations = useCallback(async (showToast = false) => {
    try {
      console.log("Fetching operations from all tables...");
      setIsLoading(true);
      setError(null);

      // Fetch all operation types in parallel
      const [depositsResult, withdrawalsResult, transfersResult, directOperationsResult] = await Promise.all([
        supabase.from('deposits').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').order('created_at', { ascending: false }),
        supabase.from('transfers').select('*').order('created_at', { ascending: false }),
        supabase.from('direct_operations').select('*').order('operation_date', { ascending: false })
      ]);

      // Check for errors
      if (depositsResult.error) {
        console.error("Error fetching deposits:", depositsResult.error);
        throw new Error(`Erreur dépôts: ${depositsResult.error.message}`);
      }
      if (withdrawalsResult.error) {
        console.error("Error fetching withdrawals:", withdrawalsResult.error);
        throw new Error(`Erreur retraits: ${withdrawalsResult.error.message}`);
      }
      if (transfersResult.error) {
        console.error("Error fetching transfers:", transfersResult.error);
        throw new Error(`Erreur virements: ${transfersResult.error.message}`);
      }
      if (directOperationsResult.error) {
        console.error("Error fetching direct operations:", directOperationsResult.error);
        throw new Error(`Erreur opérations directes: ${directOperationsResult.error.message}`);
      }

      console.log(`Fetched: ${depositsResult.data?.length || 0} deposits, ${withdrawalsResult.data?.length || 0} withdrawals, ${transfersResult.data?.length || 0} transfers, ${directOperationsResult.data?.length || 0} direct operations`);

      // Transform all operations to unified format
      const allOperations = transformToOperations(
        depositsResult.data || [],
        withdrawalsResult.data || [],
        transfersResult.data || [],
        directOperationsResult.data || []
      );

      // Deduplicate and sort
      const uniqueOperations = deduplicateOperations(allOperations);
      const sortedOperations = sortOperationsByDate(uniqueOperations);

      console.log(`Final operations count: ${sortedOperations.length}`);
      setOperations(sortedOperations);

      if (showToast) {
        toast.success("Opérations actualisées avec succès");
      }
    } catch (err: any) {
      console.error("Error in fetchOperations:", err);
      const errorMessage = err.message || "Erreur lors de la récupération des opérations";
      setError(errorMessage);
      toast.error("Erreur lors de la récupération des opérations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshOperations = useCallback(async (showToast = false) => {
    console.log("Refreshing operations...");
    await fetchOperations(showToast);
  }, [fetchOperations]);

  const deleteOperation = useCallback((operation: Operation) => {
    setOperationToDelete(operation);
    setShowDeleteDialog(true);
  }, []);

  const confirmDeleteOperation = useCallback(async (): Promise<boolean> => {
    if (!operationToDelete) return false;
    
    try {
      setIsLoading(true);
      
      // Extract operation ID and type
      const operationIdParts = operationToDelete.id.toString().split('-');
      const operationIdString = operationIdParts.length > 1 ? operationIdParts[1] : operationIdParts[0];
      const operationId = parseInt(operationIdString, 10);
      
      if (isNaN(operationId)) {
        throw new Error(`ID d'opération invalide: ${operationToDelete.id}`);
      }
      
      let deleteResult;
      
      // Delete from appropriate table based on operation type
      switch (operationToDelete.type) {
        case "deposit":
          deleteResult = await supabase
            .from('deposits')
            .delete()
            .eq('id', operationId);
          break;
        case "withdrawal":
          deleteResult = await supabase
            .from('withdrawals')
            .delete()
            .eq('id', operationId);
          break;
        case "transfer":
          deleteResult = await supabase
            .from('transfers')
            .delete()
            .eq('id', operationId);
          break;
        case "direct_transfer":
          deleteResult = await supabase
            .from('direct_operations')
            .delete()
            .eq('id', operationId);
          break;
        default:
          throw new Error(`Type d'opération inconnu: ${operationToDelete.type}`);
      }
      
      if (deleteResult.error) {
        throw new Error(deleteResult.error.message);
      }
      
      toast.success("Opération supprimée avec succès");
      setShowDeleteDialog(false);
      setOperationToDelete(undefined);
      
      // Refresh operations
      await fetchOperations();
      
      return true;
      
    } catch (error: any) {
      console.error("Error deleting operation:", error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [operationToDelete, fetchOperations]);

  // Initial fetch
  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  return {
    operations,
    isLoading,
    error,
    refreshOperations,
    fetchOperations,
    deleteOperation,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteOperation,
    operationToDelete
  };
};
