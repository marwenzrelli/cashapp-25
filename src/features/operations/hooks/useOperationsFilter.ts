
import { useState, useEffect } from "react";
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

  // Apply filters to operations
  useEffect(() => {
    const filtered = operations.filter((op) => {
      // Filter by type
      const matchesType = !filterType || op.type === filterType;
      
      // Use improved function for client search
      const matchesClient = operationMatchesSearch(op, filterClient);
      
      // Date filtering
      const matchesDate =
        (!dateRange?.from ||
          new Date(op.operation_date || op.date) >= new Date(dateRange.from)) &&
        (!dateRange?.to ||
          new Date(op.operation_date || op.date) <= new Date(dateRange.to));
      
      return matchesType && matchesClient && matchesDate;
    });

    // Format dates for display
    const formattedOperations = filtered.map(op => ({
      ...op,
      formattedDate: formatDateTime(op.operation_date || op.date)
    }));

    setFilteredOperations(formattedOperations);

    // Reset filtering state after a brief delay
    setIsFiltering(true);
    const timeout = setTimeout(() => {
      setIsFiltering(false);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [operations, filterType, filterClient, dateRange]);

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
