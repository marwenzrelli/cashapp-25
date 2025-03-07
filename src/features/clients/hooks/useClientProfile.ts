
import { useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { useClientData } from "./clientProfile/useClientData";
import { useClientOperationsFilter } from "./clientProfile/useClientOperationsFilter";
import { useClientProfileExport } from "./clientProfile/useClientProfileExport";
import { useRealTimeBalance } from "./clientProfile/useRealTimeBalance";
import { useClientBalanceRefresh } from "./clientProfile/useClientBalanceRefresh";
import { useOperationsVerification } from "./clientProfile/useOperationsVerification";

export const useClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { operations } = useOperations();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const clientId = id ? Number(id) : null;
  
  // Debug to ensure ID is parsed correctly
  console.log("useClientProfile - Raw ID from params:", id, "Parsed client ID:", clientId);
  
  // Get client data
  const { client, isLoading, error, fetchClient } = useClientData(clientId);
  
  // Refetch client manually
  const refetchClient = useCallback(() => {
    if (clientId) {
      console.log("Manual refetch of client data for ID:", clientId);
      fetchClient(clientId);
    } else {
      console.error("Cannot refetch: No client ID available");
    }
  }, [clientId, fetchClient]);
  
  // Real-time balance tracking
  const { realTimeBalance, setRealTimeBalance } = useRealTimeBalance(clientId);
  
  // Client balance refresh functionality
  const { refreshClientBalance } = useClientBalanceRefresh(
    clientId, 
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
    setIsCustomRange
  } = useClientOperationsFilter(operations, client);
  
  // Verify operations when client is loaded
  useOperationsVerification(client, operations, clientOperations, refreshClientBalance);
  
  // Export functionality
  const { formatAmount, exportToExcel, exportToPDF } = useClientProfileExport(
    client, 
    clientOperations,
    qrCodeRef
  );

  // Get effective balance (real-time or from client object)
  const effectiveBalance = realTimeBalance !== null ? realTimeBalance : client?.solde;

  return {
    client,
    clientId,
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
    formatAmount,
    exportToExcel,
    exportToPDF,
    refetchClient,
    refreshClientBalance,
    clientBalance: effectiveBalance
  };
};
