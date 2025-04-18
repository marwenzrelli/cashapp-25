
import { useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { useClientData } from "./clientProfile/useClientData";
import { useClientOperationsFilter } from "./clientProfile/useClientOperationsFilter";
import { useClientProfileExport } from "./clientProfile/useClientProfileExport";
import { useRealTimeBalance } from "./clientProfile/useRealTimeBalance";
import { useClientBalanceRefresh } from "./clientProfile/useClientBalanceRefresh";
import { useOperationsVerification } from "./clientProfile/useOperationsVerification";

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
    isPepsiMen // Export this flag
  };
};
