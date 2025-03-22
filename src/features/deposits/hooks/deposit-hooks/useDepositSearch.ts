
import { useState, useEffect, useMemo } from "react";
import { Deposit } from "@/components/deposits/types";
import { isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

export const useDepositSearch = (deposits: Deposit[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Filter deposits based on search term and date range
  const filteredDeposits = useMemo(() => {
    if (!deposits) return [];
    
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
        const depositDate = new Date(deposit.operation_date || deposit.created_at);
        try {
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
    setSearchTerm,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    dateRange,
    setDateRange,
    filteredDeposits,
    paginatedDeposits,
    totalItems,
  };
};
