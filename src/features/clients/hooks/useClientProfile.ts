
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { useClientData } from "./clientProfile/useClientData";
import { useClientOperationsFilter } from "./clientProfile/useClientOperationsFilter";
import { useClientProfileExport } from "./clientProfile/useClientProfileExport";
import { useClientBalanceRefresh } from "./clientProfile/useClientBalanceRefresh";
import { useRealTimeBalance } from "./clientProfile/useRealTimeBalance";
import { Operation } from "@/features/operations/types";
import { subDays } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export const useClientProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clientId = id ? parseInt(id, 10) : null;
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "deposits" | "withdrawals" | "transfers">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Get client data using the custom hook
  const { client, clientOperations, isLoading, error, fetchClient, fetchClientOperations, clientBalance } = useClientData(clientId);
  
  // Filter operations based on type, search term, and date range
  const { filteredOperations } = useClientOperationsFilter(
    clientOperations,
    selectedType,
    searchTerm,
    dateRange
  );
  
  // Setup export functionality
  const { exportToExcel, exportToPDF, formatAmount } = useClientProfileExport(client, filteredOperations);
  
  // Setup balance refresh functionality
  const { refreshClientBalance } = useClientBalanceRefresh(clientId, fetchClient);
  
  // Initialize real-time balance subscription
  useRealTimeBalance(clientId, fetchClient);
  
  // Function to refresh client operations
  const refreshClientOperations = useCallback(async () => {
    if (clientId) {
      console.log("Refreshing client operations for client ID:", clientId);
      await fetchClientOperations();
    }
  }, [clientId, fetchClientOperations]);
  
  // Function to refetch everything about the client
  const refetchClient = useCallback(async () => {
    console.log("Refetching all client data for client ID:", clientId);
    if (clientId) {
      // Invalidate all client-related queries
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clientOperations', clientId] });
      
      // Fetch fresh data
      await fetchClient();
      await fetchClientOperations();
    }
  }, [clientId, fetchClient, fetchClientOperations, queryClient]);
  
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
    refreshClientOperations,
    clientBalance
  };
};
