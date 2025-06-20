
import { useState, useEffect, useMemo } from "react";
import { Deposit } from "../../types";
import { containsPartialText } from "@/features/operations/utils/display-helpers";
import { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";

export const useDepositSearch = (deposits: Deposit[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  useEffect(() => {
    // Reset current page when search term, date range, or items per page changes
    setCurrentPage(1);
  }, [searchTerm, dateRange, itemsPerPage]);

  // Define searchTerms before using it in filteredDeposits
  const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());

  const filteredDeposits = useMemo(() => {
    return deposits.filter(deposit => {
      // Search term filter
      const searchMatch = !searchTerm.trim() || searchTerms.some(term => {
        // Recherche sur le nom du client
        if (containsPartialText(deposit.client_name, term)) return true;
        
        // Recherche sur les notes/description
        if (deposit.description && containsPartialText(deposit.description, term)) return true;
        
        // Recherche sur l'ID
        if (deposit.id.toString().includes(term)) return true;
        
        // Recherche sur le montant
        if (deposit.amount.toString().includes(term)) return true;
        
        return false;
      });
      
      // Date range filter
      let dateMatch = true;
      if (dateRange?.from && dateRange?.to) {
        try {
          const depositDate = new Date(deposit.operation_date || deposit.created_at || deposit.date);
          
          // Check if the date is valid
          if (isNaN(depositDate.getTime())) {
            console.error(`Invalid date: ${deposit.operation_date || deposit.created_at || deposit.date}`);
            return false;
          }
          
          // Use proper date boundaries for comparison
          const startDate = startOfDay(dateRange.from);
          const endDate = endOfDay(dateRange.to);
          
          dateMatch = isWithinInterval(depositDate, {
            start: startDate,
            end: endDate
          });
        } catch (error) {
          console.error("Error checking date interval:", error);
          dateMatch = false;
        }
      }
      
      return searchMatch && dateMatch;
    });
  }, [deposits, searchTerm, searchTerms, dateRange]);

  // Pagination des versements - handle "tous" option correctly
  const paginatedDeposits = useMemo(() => {
    if (itemsPerPage === "tous") {
      return filteredDeposits;
    }
    
    const itemsPerPageNum = parseInt(itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPageNum;
    const endIndex = startIndex + itemsPerPageNum;
    
    return filteredDeposits.slice(startIndex, endIndex);
  }, [filteredDeposits, itemsPerPage, currentPage]);

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
    totalItems
  };
};
