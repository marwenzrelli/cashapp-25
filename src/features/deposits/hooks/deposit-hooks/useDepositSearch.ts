
import { useState, useEffect } from "react";
import { Deposit } from "@/components/deposits/types";

export const useDepositSearch = (deposits: Deposit[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [filteredDeposits, setFilteredDeposits] = useState<Deposit[]>([]);
  const [paginatedDeposits, setPaginatedDeposits] = useState<Deposit[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // Update filtered deposits whenever deposits or search term changes
  useEffect(() => {
    console.log("Filter effect running with deposits:", deposits?.length);
    
    if (!deposits || deposits.length === 0) {
      console.log("No deposits to filter");
      setFilteredDeposits([]);
      return;
    }

    const filtered = deposits.filter(deposit => {
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

    console.log("Filtered deposits:", filtered.length);
    setFilteredDeposits(filtered);
    setTotalItems(filtered.length);
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [deposits, searchTerm]);

  // Update paginated deposits whenever filtered deposits or pagination settings change
  useEffect(() => {
    console.log("Pagination effect running with filtered deposits:", filteredDeposits?.length);
    
    if (!filteredDeposits || filteredDeposits.length === 0) {
      console.log("No filtered deposits to paginate");
      setPaginatedDeposits([]);
      return;
    }

    // Calculate pagination correctly
    const totalPages = Math.ceil(filteredDeposits.length / parseInt(itemsPerPage));
    
    // Ensure current page is valid
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }

    const startIndex = (validCurrentPage - 1) * parseInt(itemsPerPage);
    const endIndex = validCurrentPage * parseInt(itemsPerPage);
    
    const paginated = filteredDeposits.slice(startIndex, endIndex);
    console.log("Paginated deposits:", paginated.length);
    setPaginatedDeposits(paginated);
  }, [filteredDeposits, currentPage, itemsPerPage]);

  const handleSearchChange = (term: string) => {
    console.log("Search term changed:", term);
    setSearchTerm(term);
  };

  const handleItemsPerPageChange = (value: string) => {
    console.log("Items per page changed:", value);
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
