
import { useState, useEffect, useMemo, useCallback } from "react";
import { Deposit } from "@/features/deposits/types";
import { isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

export const useDepositSearch = (deposits: Deposit[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Stabilized setters
  const stableSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const stableSetItemsPerPage = useCallback((value: string) => {
    setItemsPerPage(value);
  }, []);

  const stableSetCurrentPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const stableSetDateRange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
  }, []);

  // Filter deposits based on search term and date range
  const filteredDeposits = useMemo(() => {
    if (!deposits || deposits.length === 0) return [];
    
    // Skip filtering if no filters are active
    if (!searchTerm && !dateRange?.from && !dateRange?.to) {
      return deposits;
    }
    
    return deposits.filter((deposit) => {
      // Search term filter
      const searchMatch = 
        !searchTerm || 
        deposit.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.amount.toString().includes(searchTerm) ||
        deposit.id.toString().includes(searchTerm);
      
      // Date range filter
      let dateMatch = true;
      if (dateRange?.from && dateRange?.to) {
        try {
          const depositDate = new Date(deposit.operation_date || deposit.created_at);
          dateMatch = isWithinInterval(depositDate, {
            start: dateRange.from,
            end: dateRange.to
          });
        } catch (error) {
          console.error("Error checking date interval:", error);
          dateMatch = false;
        }
      }
      
      return searchMatch && dateMatch;
    });
  }, [deposits, searchTerm, dateRange]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, dateRange]);

  // Calculate paginated deposits
  const paginatedDeposits = useMemo(() => {
    if (!filteredDeposits.length) return [];
    
    const startIndex = (currentPage - 1) * parseInt(itemsPerPage);
    return filteredDeposits.slice(
      startIndex,
      startIndex + parseInt(itemsPerPage)
    );
  }, [filteredDeposits, currentPage, itemsPerPage]);

  // Calculate total number of items for pagination
  const totalItems = filteredDeposits.length;

  return {
    searchTerm,
    setSearchTerm: stableSetSearchTerm,
    itemsPerPage,
    setItemsPerPage: stableSetItemsPerPage,
    currentPage,
    setCurrentPage: stableSetCurrentPage,
    dateRange,
    setDateRange: stableSetDateRange,
    filteredDeposits,
    paginatedDeposits,
    totalItems,
  };
};
