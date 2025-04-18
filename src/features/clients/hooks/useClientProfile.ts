
import { useRef, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { useClientData } from "./clientProfile/useClientData";
import { useClientOperationsFilter } from "./clientProfile/useClientOperationsFilter";
import { useClientProfileExport } from "./clientProfile/useClientProfileExport";
import { useRealTimeBalance } from "./clientProfile/useRealTimeBalance";
import { useClientBalanceRefresh } from "./clientProfile/useClientBalanceRefresh";
import { useOperationsVerification } from "./clientProfile/useOperationsVerification";
import { Operation } from "@/features/operations/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useClientProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { operations, refreshOperations } = useOperations();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const parsedClientId = clientId ? parseInt(clientId, 10) : null;
  
  // Determine if this is the pepsi men client
  const isPepsiMen = useMemo(() => parsedClientId === 4, [parsedClientId]);
  
  // Debug to ensure ID is parsed correctly
  console.log("useClientProfile - Raw ID from params:", clientId, "Parsed client ID:", parsedClientId);
  
  // Get client data
  const { client, isLoading, error, fetchClient } = useClientData(parsedClientId);
  
  // Refetch client manually
  const refetchClient = useCallback(() => {
    if (parsedClientId) {
      console.log("Manual refetch of client data for ID:", parsedClientId);
      fetchClient(parsedClientId);
    } else {
      console.error("Cannot refetch: No client ID available");
    }
  }, [parsedClientId, fetchClient]);
  
  // Real-time balance tracking
  const { realTimeBalance, setRealTimeBalance } = useRealTimeBalance(parsedClientId);
  
  // Client balance refresh functionality
  const { refreshClientBalance } = useClientBalanceRefresh(
    parsedClientId, 
    client, 
    setRealTimeBalance, 
    refetchClient
  );
  
  // Filter operations
  const {
    clientOperations,
    filteredOperations,
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    isCustomRange,
    setIsCustomRange,
    showAllDates,
    setShowAllDates,
    isPepsiMen: isPepsiClient
  } = useClientOperationsFilter(operations, client);
  
  // Verify operations when client is loaded
  useOperationsVerification(client, operations, clientOperations, refreshClientBalance);
  
  // Export functionality
  const { formatAmount, exportToExcel, exportToPDF } = useClientProfileExport(
    client, 
    clientOperations,
    qrCodeRef
  );

  // Function to update operation
  const updateOperation = async (updatedOperation: Operation): Promise<void> => {
    try {
      console.log("Updating operation in profile page:", updatedOperation);
      
      const operationType = updatedOperation.type;
      const operationIdParts = updatedOperation.id.toString().split('-');
      const operationIdString = operationIdParts.length > 1 ? operationIdParts[1] : operationIdParts[0];
      const operationId = parseInt(operationIdString, 10);
      
      if (isNaN(operationId)) {
        console.error("Invalid operation ID:", operationIdString);
        throw new Error("Format d'ID invalide");
      }
      
      let error = null;
      
      if (operationType === 'deposit') {
        const { error: updateError } = await supabase
          .from('deposits')
          .update({
            client_name: updatedOperation.fromClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            notes: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      } else if (operationType === 'withdrawal') {
        const { error: updateError } = await supabase
          .from('withdrawals')
          .update({
            client_name: updatedOperation.fromClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            notes: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      } else if (operationType === 'transfer') {
        const { error: updateError } = await supabase
          .from('transfers')
          .update({
            from_client: updatedOperation.fromClient,
            to_client: updatedOperation.toClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            reason: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      }
      
      if (error) {
        console.error("Error updating operation:", error);
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }
      
      // Refresh operations list and balance
      await refreshClientOperations();
    } catch (error: any) {
      console.error("Error updating operation:", error);
      throw new Error(error?.message || "Échec de la mise à jour");
    }
  };

  // Get effective balance (real-time or from client object)
  const effectiveBalance = realTimeBalance !== null ? realTimeBalance : client?.solde;

  // Function to refresh operations data and update client data if needed
  const refreshClientOperations = useCallback(async () => {
    console.log("Refreshing operations for client:", client?.id);
    await refreshOperations();
    // Optionally refresh client info to update balance
    if (parsedClientId) {
      setTimeout(() => {
        refreshClientBalance();
      }, 500);
    }
  }, [refreshOperations, client, parsedClientId, refreshClientBalance]);

  // Effect to refresh operations when component mounts
  useEffect(() => {
    if (client && client.id) {
      refreshClientOperations();
    }
  }, [client?.id]);

  return {
    client,
    clientId: parsedClientId,
    clientOperations,
    filteredOperations,
    isLoading,
    error,
    navigate,
    qrCodeRef,
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    isCustomRange,
    setIsCustomRange,
    showAllDates,
    setShowAllDates,
    formatAmount,
    exportToExcel,
    exportToPDF,
    refetchClient,
    refreshClientBalance,
    refreshClientOperations,
    clientBalance: effectiveBalance,
    isPepsiMen, // Export this flag
    updateOperation // Add the update operation function
  };
};
