
import { useState, useEffect, useMemo } from "react";
import { Operation } from "../types";
import { DateRange } from "react-day-picker";
import { formatDateTime } from "../types";
import { operationMatchesSearch } from "../utils/display-helpers";

export const useOperationsFilter = (operations: Operation[]) => {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);

  // Optimized filtering with useMemo and minimal computation
  const computedFilteredOperations = useMemo(() => {
    // Short circuit if no operations
    if (!operations.length) return [];
    
    // Start filtering process
    setIsFiltering(true);
    
    // Fast filter implementation
    const filtered = filterType || filterClient || (dateRange?.from && dateRange?.to) 
      ? operations.filter((op) => {
          // Skip filtering if no filters are applied
          if (!filterType && !filterClient && !(dateRange?.from && dateRange?.to)) {
            return true;
          }
          
          // Filter by type - fast check first
          if (filterType && op.type !== filterType) {
            return false;
          }
          
          // Filter by client search
          if (filterClient && !operationMatchesSearch(op, filterClient)) {
            return false;
          }
          
          // Filter by date range
          if (dateRange?.from && dateRange?.to) {
            const opDate = new Date(op.operation_date || op.date);
            if (opDate < dateRange.from || opDate > dateRange.to) {
              return false;
            }
          }
          
          return true;
        })
      : operations;

    // Format dates for display - only for filtered operations
    return filtered.map(op => ({
      ...op,
      formattedDate: formatDateTime(op.operation_date || op.date)
    }));
  }, [operations, filterType, filterClient, dateRange]);

  // Update filtered operations without delay
  useEffect(() => {
    // Set filtered operations immediately
    setFilteredOperations(computedFilteredOperations);
    
    // Reset filtering state without delay
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
