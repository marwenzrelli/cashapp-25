
import { useState } from "react";
import { Deposit } from "@/components/deposits/types";

export const useDepositSearch = (deposits: Deposit[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("10");

  // Corrected filtering logic
  const filteredDeposits = deposits.filter(deposit => {
    // If search term is empty, return all deposits
    if (!searchTerm.trim()) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Check if the client name includes the search term
    if (deposit.client_name.toLowerCase().includes(lowerSearchTerm)) {
      return true;
    }
    
    // Check if the description includes the search term
    if (deposit.description && deposit.description.toLowerCase().includes(lowerSearchTerm)) {
      return true;
    }
    
    // Check if the ID includes the search term
    if (deposit.id.toString().includes(lowerSearchTerm)) {
      return true;
    }
    
    return false;
  });

  // Calculate pagination correctly
  const totalItems = filteredDeposits.length;
  const totalPages = Math.ceil(totalItems / parseInt(itemsPerPage));
  
  // Ensure current page is valid
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }

  const paginatedDeposits = filteredDeposits.slice(
    (validCurrentPage - 1) * parseInt(itemsPerPage),
    validCurrentPage * parseInt(itemsPerPage)
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  return {
    searchTerm,
    setSearchTerm: handleSearchChange,
    itemsPerPage,
    setItemsPerPage: handleItemsPerPageChange,
    currentPage,
    setCurrentPage,
    filteredDeposits,
    paginatedDeposits,
    totalItems
  };
};
