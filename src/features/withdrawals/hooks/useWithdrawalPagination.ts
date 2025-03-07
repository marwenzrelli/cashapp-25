
import { useState, useEffect } from "react";
import { Withdrawal } from "../types";
import { containsPartialText } from "@/features/operations/utils/display-helpers";

export const useWithdrawalPagination = (withdrawals: Withdrawal[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    // Reset current page when search term changes
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (!searchTerm.trim()) return true;
    
    const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());
    
    return searchTerms.some(term => {
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
  });

  // Pagination des retraits
  const paginatedWithdrawals = filteredWithdrawals.slice(
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
    filteredWithdrawals,
    paginatedWithdrawals
  };
};
