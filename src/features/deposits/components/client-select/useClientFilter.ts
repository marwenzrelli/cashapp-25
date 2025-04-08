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

  // Optimize debounce for faster search feedback
  useEffect(() => {
    // Apply search immediately for short terms (faster UI feedback)
    if (clientSearch.length <= 2) {
      setDebouncedSearch(clientSearch);
      return;
    }
    
    // Otherwise use a short debounce
    const handler = setTimeout(() => {
      setDebouncedSearch(clientSearch);
    }, 100); // Reduced to 100ms for faster feedback
    
    return () => {
      clearTimeout(handler);
    };
  }, [clientSearch]);

  // Optimize filtering with simplified matching logic
  const filteredClients = useMemo(() => {
    if (!debouncedSearch.trim()) return clients;
    
    const searchTerm = debouncedSearch.toLowerCase().trim();
    
    // Simple, direct matching for better performance
    return clients.filter(client => {
      const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
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
