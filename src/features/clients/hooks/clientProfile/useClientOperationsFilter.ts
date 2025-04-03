
import { useMemo, useState } from "react";
import { Operation } from "@/features/operations/types";
import { Client } from "@/features/clients/types";
import { DateRange } from "react-day-picker";

export const useClientOperationsFilter = (
  operations: Operation[],
  client: Client | null
) => {
  const [selectedType, setSelectedType] = useState<"all" | "deposit" | "withdrawal" | "transfer">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isCustomRange, setIsCustomRange] = useState<boolean>(false);
  const [showAllDates, setShowAllDates] = useState<boolean>(true); // Default to showing all dates

  // Only include operations for this client
  const clientOperations = useMemo(() => {
    if (!client) return [];
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    console.log(`Filtering operations for client: "${clientFullName}", total operations: ${operations.length}`);
    
    // Debug log to check for missing operations
    if (client.id === 4) {
      console.log("Special debugging for client ID 4:");
      operations.forEach(op => {
        console.log(`Operation ID: ${op.id}, Type: ${op.type}, Client: ${op.fromClient}`);
      });
    }
    
    return operations.filter(operation => {
      const isFromClient = operation.fromClient && operation.fromClient.includes(clientFullName);
      const isToClient = operation.toClient && operation.toClient.includes(clientFullName);
      return isFromClient || isToClient;
    });
  }, [operations, client]);

  // Apply filters to client operations
  const filteredOperations = useMemo(() => {
    if (!clientOperations || clientOperations.length === 0) return [];
    
    let filtered = [...clientOperations];
    
    // Filter by operation type
    if (selectedType !== "all") {
      filtered = filtered.filter(operation => operation.type === selectedType);
    }
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(operation => {
        return (
          operation.description?.toLowerCase().includes(search) ||
          operation.fromClient?.toLowerCase().includes(search) ||
          operation.toClient?.toLowerCase().includes(search) ||
          operation.amount?.toString().includes(search)
        );
      });
    }
    
    // Filter by date range only if not showing all dates
    if (!showAllDates && dateRange) {
      if (dateRange.from) {
        const fromDate = dateRange.from;
        fromDate.setHours(0, 0, 0, 0);
        
        filtered = filtered.filter(operation => {
          const operationDate = new Date(operation.operation_date || operation.date);
          return operationDate >= fromDate;
        });
      }
      
      if (dateRange.to) {
        const toDate = dateRange.to;
        toDate.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(operation => {
          const operationDate = new Date(operation.operation_date || operation.date);
          return operationDate <= toDate;
        });
      }
    }
    
    // Log filtered results for debugging
    if (client?.id === 4) {
      console.log(`Filtered operations for client ID 4: ${filtered.length}/${clientOperations.length}`);
      console.log("Filtered operation IDs:", filtered.map(op => op.id).join(", "));
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date);
      const dateB = new Date(b.operation_date || b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [clientOperations, selectedType, searchTerm, dateRange, showAllDates, client]);

  return {
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
    setShowAllDates
  };
};
