
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

  // Use useMemo for more efficient filtering
  const computedFilteredOperations = useMemo(() => {
    // Start filtering process
    setIsFiltering(true);
    
    const filtered = operations.filter((op) => {
      // Filter by type
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
    });

    // Format dates for display
    return filtered.map(op => ({
      ...op,
      formattedDate: formatDateTime(op.operation_date || op.date)
    }));
  }, [operations, filterType, filterClient, dateRange]);

  // Update filtered operations with short debounce
  useEffect(() => {
    setFilteredOperations(computedFilteredOperations);
    
    // Reset filtering state after a brief delay
    const timeout = setTimeout(() => {
      setIsFiltering(false);
    }, 100); // Reduced to 100ms for faster feedback
    
    return () => clearTimeout(timeout);
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
