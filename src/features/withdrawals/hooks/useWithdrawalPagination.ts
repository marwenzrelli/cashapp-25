
import { useState, useEffect } from "react";
import { Withdrawal } from "../types";
import { containsPartialText } from "@/features/operations/utils/display-helpers";
import { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";

export const useWithdrawalPagination = (withdrawals: Withdrawal[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  useEffect(() => {
    // Reset current page when search term or date range changes
    setCurrentPage(1);
  }, [searchTerm, dateRange]);

  // Define searchTerms before using it in filteredWithdrawals
  const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    // Search term filter
    const searchMatch = !searchTerm.trim() || searchTerms.some(term => {
      // Recherche sur le nom du client
      if (containsPartialText(withdrawal.client_name, term)) return true;
      
      // Recherche sur les notes
      if (withdrawal.notes && containsPartialText(withdrawal.notes, term)) return true;
      
      // Recherche sur l'ID
      if (withdrawal.id.toString().includes(term)) return true;
      
      // Recherche sur le montant
      if (withdrawal.amount.toString().includes(term)) return true;
      
      return false;
    });
    
    // Date range filter
    let dateMatch = true;
    if (dateRange?.from && dateRange?.to) {
      try {
        const withdrawalDate = new Date(withdrawal.operation_date || withdrawal.created_at);
        
        // Check if the date is valid
        if (isNaN(withdrawalDate.getTime())) {
          console.error(`Invalid date: ${withdrawal.operation_date || withdrawal.created_at}`);
          return false;
        }
        
        // Use proper date boundaries for comparison
        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        
        dateMatch = isWithinInterval(withdrawalDate, {
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

  // Pagination des retraits - handle "tous" option
  const paginatedWithdrawals = itemsPerPage === "tous" 
    ? filteredWithdrawals 
    : filteredWithdrawals.slice(
        (currentPage - 1) * parseInt(itemsPerPage),
        currentPage * parseInt(itemsPerPage)
      );

  return {
    searchTerm,
    setSearchTerm,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    dateRange,
    setDateRange,
    filteredWithdrawals,
    paginatedWithdrawals
  };
};
