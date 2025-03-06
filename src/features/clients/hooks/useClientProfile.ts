
import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { useClientData } from "./clientProfile/useClientData";
import { useClientOperationsFilter } from "./clientProfile/useClientOperationsFilter";
import { useClientProfileExport } from "./clientProfile/useClientProfileExport";

export const useClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { operations } = useOperations();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const clientId = id ? Number(id) : null;
  
  // Get client data
  const { client, isLoading, error } = useClientData(clientId);
  
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
    exportToPDF
  };
};
