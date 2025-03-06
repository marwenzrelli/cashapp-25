
import { useState, useEffect, useMemo } from "react";
import { Operation } from "@/features/operations/types";
import { Client } from "@/features/clients/types";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, isWithinInterval, isSameDay, parseISO } from "date-fns";

export const useClientOperationsFilter = (operations: Operation[], client: Client | null) => {
  const [selectedType, setSelectedType] = useState<Operation["type"] | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Reset filters when client changes
  useEffect(() => {
    setSelectedType("all");
    setSearchTerm("");
    setDateRange(undefined);
    setIsCustomRange(false);
  }, [client?.id]);

  // Filter operations for the current client
  const clientOperations = useMemo(() => {
    if (!client || !operations.length) return [];
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    console.log("Filtering operations for client:", clientFullName, "Total operations:", operations.length);
    
    return operations.filter(op => {
      if (op.type === "deposit" || op.type === "withdrawal") {
        return op.fromClient === clientFullName;
      } else if (op.type === "transfer") {
        return op.fromClient === clientFullName || op.toClient === clientFullName;
      }
      return false;
    });
  }, [operations, client]);

  // Apply type, search and date filters
  const filteredOperations = useMemo(() => {
    if (!clientOperations.length) return [];
    
    console.log("Applying filters to operations:", {
      totalOps: clientOperations.length,
      selectedType,
      searchTerm,
      hasDateRange: !!dateRange
    });

    return clientOperations.filter(op => {
      // Type filter
      const typeMatches = selectedType === "all" || op.type === selectedType;
      
      // Search term filter
      const searchMatches = !searchTerm || 
        (op.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         String(op.amount).includes(searchTerm));
      
      // Date filter
      let dateMatches = true;
      if (dateRange && dateRange.from) {
        const start = startOfDay(dateRange.from);
        const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        const opDate = parseISO(op.date);
        
        dateMatches = isWithinInterval(opDate, { start, end }) || 
                     isSameDay(opDate, dateRange.from) || 
                     (dateRange.to && isSameDay(opDate, dateRange.to));
      }
      
      return typeMatches && searchMatches && dateMatches;
    });
  }, [clientOperations, selectedType, searchTerm, dateRange]);

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
    setIsCustomRange
  };
};
