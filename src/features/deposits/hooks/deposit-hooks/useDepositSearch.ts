
import { useState } from "react";
import { Deposit } from "@/components/deposits/types";

export const useDepositSearch = (deposits: Deposit[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("10");

  const filteredDeposits = deposits.filter(deposit => {
    if (!searchTerm.trim()) return true;
    
    const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());
    
    return searchTerms.some(term => {
      if (deposit.client_name.toLowerCase().includes(term)) return true;
      
      if (deposit.description && deposit.description.toLowerCase().includes(term)) return true;
      
      if (deposit.id.toString().includes(term)) return true;
      
      return false;
    });
  });

  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * parseInt(itemsPerPage),
    currentPage * parseInt(itemsPerPage)
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return {
    searchTerm,
    setSearchTerm: handleSearchChange,
    itemsPerPage,
    setItemsPerPage: handleItemsPerPageChange,
    currentPage,
    setCurrentPage,
    filteredDeposits,
    paginatedDeposits
  };
};
