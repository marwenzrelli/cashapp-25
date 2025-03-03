
import { useState, useEffect } from "react";
import { type Client } from "@/features/clients/types";

export const useClientFilter = (clients: Client[], isOpen: boolean) => {
  const [clientSearch, setClientSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setClientSearch("");
      setDebouncedSearch("");
    }
  }, [isOpen]);

  // Debounce search input to prevent immediate filtering/selection
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(clientSearch);
    }, 300); // 300ms debounce delay
    
    return () => {
      clearTimeout(handler);
    };
  }, [clientSearch]);

  // Filter clients based on debounced search
  const filteredClients = clients.filter(client => {
    if (!debouncedSearch.trim()) return true;
    const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
    const searchTerm = debouncedSearch.toLowerCase().trim();

    // Search by name, phone or ID
    return fullName.includes(searchTerm) || 
           (client.telephone && client.telephone.includes(searchTerm)) || 
           client.id.toString().includes(searchTerm);
  });

  return {
    clientSearch,
    setClientSearch,
    filteredClients
  };
};
