
import { useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { useClientData } from "./clientProfile/useClientData";
import { useClientOperationsFilter } from "./clientProfile/useClientOperationsFilter";
import { useClientProfileExport } from "./clientProfile/useClientProfileExport";
import { checkClientOperations } from "./utils/checkClientOperations";

export const useClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { operations } = useOperations();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const clientId = id ? Number(id) : null;
  
  // Get client data
  const { client, isLoading, error, fetchClient } = useClientData(clientId);
  
  // Function to manually refetch client data
  const refetchClient = useCallback(() => {
    if (clientId) {
      console.log("Manually refetching client data for ID:", clientId);
      fetchClient(clientId);
    } else {
      console.error("Cannot refetch: No client ID available");
    }
  }, [clientId, fetchClient]);
  
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
  
  // Export functionality
  const { formatAmount, exportToExcel, exportToPDF } = useClientProfileExport(
    client, 
    clientOperations,
    qrCodeRef
  );
  
  // Check for operations if client loads but no operations are found
  useEffect(() => {
    const verifyClientOperations = async () => {
      if (client && operations.length > 0 && clientOperations.length === 0) {
        console.log("Client found but no operations matched. Running operation check...");
        const clientFullName = `${client.prenom} ${client.nom}`.trim();
        const opsCheck = await checkClientOperations(clientFullName, client.id);
        
        if (opsCheck.totalCount > 0) {
          console.log(`Found ${opsCheck.totalCount} operations in database, but none matched in memory. 
          This suggests a client name format mismatch.`);
        }
      }
    };
    
    verifyClientOperations();
  }, [client, operations, clientOperations]);

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
    refetchClient
  };
};
