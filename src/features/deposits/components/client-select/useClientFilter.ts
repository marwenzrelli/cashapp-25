
import { useState, useEffect, useMemo } from "react";
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
    }, 200); // Reduced to 200ms for faster feedback
    
    return () => {
      clearTimeout(handler);
    };
  }, [clientSearch]);

  // Optimize filtering with useMemo
  const filteredClients = useMemo(() => {
    if (!debouncedSearch.trim()) return clients;
    
    const searchTerm = debouncedSearch.toLowerCase().trim();
    
    return clients.filter(client => {
      const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
      
      // Search by name, phone or ID
      return fullName.includes(searchTerm) || 
             (client.telephone && client.telephone.includes(searchTerm)) || 
             client.id.toString().includes(searchTerm);
    });
  }, [clients, debouncedSearch]);

  return {
    clientSearch,
    setClientSearch,
    filteredClients
  };
};
