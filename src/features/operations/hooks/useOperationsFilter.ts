
import { useState, useEffect, useMemo } from "react";
import { Operation } from "../types";
import { DateRange } from "react-day-picker";
import { formatDateTime } from "../types";

export const useOperationsFilter = (operations: Operation[]) => {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);

  // Ultra-optimized filtering with useMemo and minimal computation
  const computedFilteredOperations = useMemo(() => {
    // Abort if no operations to filter
    if (!operations.length) return [];
    
    // Skip filtering if no filters applied
    if (!filterType && !filterClient && !(dateRange?.from && dateRange?.to)) {
      return operations.map(op => ({
        ...op,
        formattedDate: formatDateTime(op.operation_date || op.date)
      }));
    }
    
    // Fast filter implementation
    const filtered = [];
    const clientSearchLower = filterClient.toLowerCase();
    
    // Limit to first 100 matches for better performance
    let matchCount = 0;
    const maxMatches = 100;
    
    for (const op of operations) {
      // Type filter check - fastest check first
      if (filterType && op.type !== filterType) continue;
      
      // Client search filter
      if (clientSearchLower) {
        const clientName = (op.fromClient || '').toLowerCase();
        const toClient = (op.toClient || '').toLowerCase();
        const description = (op.description || '').toLowerCase();
        
        if (!clientName.includes(clientSearchLower) && 
            !toClient.includes(clientSearchLower) && 
            !description.includes(clientSearchLower) &&
            !op.id.toString().includes(clientSearchLower)) {
          continue;
        }
      }
      
      // Date range filter - more expensive so do it last
      if (dateRange?.from && dateRange?.to) {
        const opDate = new Date(op.operation_date || op.date);
        if (opDate < dateRange.from || opDate > dateRange.to) {
          continue;
        }
      }
      
      // This operation passed all filters
      filtered.push({
        ...op,
        formattedDate: formatDateTime(op.operation_date || op.date)
      });
      
      // Limit results for better performance
      matchCount++;
      if (matchCount >= maxMatches) break;
    }
    
    return filtered;
  }, [operations, filterType, filterClient, dateRange]);

  // Update filtered operations without delay
  useEffect(() => {
    setFilteredOperations(computedFilteredOperations);
    setIsFiltering(false);
  }, [computedFilteredOperations]);

  return {
    filterType,
    setFilterType,
    filterClient,
    setFilterClient,
    dateRange,
    setDateRange,
    isFiltering,
    filteredOperations
  };
};
