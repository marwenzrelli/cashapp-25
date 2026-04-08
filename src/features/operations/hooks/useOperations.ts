
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "@/features/operations/types";
import { transformToOperations, deduplicateOperations, sortOperationsByDate } from "./utils/operationTransformers";
import { toast } from "sonner";
import { fetchAllRows } from "@/features/statistics/utils/fetchAllRows";
import { logger } from "@/utils/logger";

export const useOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationToDelete, setOperationToDelete] = useState<Operation | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchOperations = useCallback(async (showToast = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const [depositsData, withdrawalsData, transfersData, directOpsData] = await Promise.all([
        fetchAllRows('deposits', { orderBy: 'created_at', ascending: false }),
        fetchAllRows('withdrawals', { orderBy: 'created_at', ascending: false }),
        fetchAllRows('transfers', { orderBy: 'created_at', ascending: false }),
        fetchAllRows('direct_operations', { orderBy: 'operation_date', ascending: false })
      ]);

      logger.log(`Fetched: ${depositsData?.length || 0} deposits, ${withdrawalsData?.length || 0} withdrawals, ${transfersData?.length || 0} transfers, ${directOpsData?.length || 0} direct operations`);

      const allOperations = transformToOperations(
        depositsData || [],
        withdrawalsData || [],
        transfersData || [],
        directOpsData || []
      );

      const uniqueOperations = deduplicateOperations(allOperations);
      const sortedOperations = sortOperationsByDate(uniqueOperations);

      logger.log(`Final operations count: ${sortedOperations.length}`);
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
      
      const operationIdParts = operationToDelete.id.toString().split('-');
      const operationIdString = operationIdParts.length > 1 ? operationIdParts[1] : operationIdParts[0];
      const operationId = parseInt(operationIdString, 10);
      
      if (isNaN(operationId)) {
        throw new Error(`ID d'opération invalide: ${operationToDelete.id}`);
      }
      
      let deleteResult;
      
      switch (operationToDelete.type) {
        case "deposit":
          deleteResult = await supabase.from('deposits').delete().eq('id', operationId);
          break;
        case "withdrawal":
          deleteResult = await supabase.from('withdrawals').delete().eq('id', operationId);
          break;
        case "transfer":
          deleteResult = await supabase.from('transfers').delete().eq('id', operationId);
          break;
        case "direct_transfer":
          deleteResult = await supabase.from('direct_operations').delete().eq('id', operationId);
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
