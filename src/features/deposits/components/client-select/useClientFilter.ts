
import { useState, useEffect, useMemo } from "react";
import { type Client } from "@/features/clients/types";

export const useClientFilter = (clients: Client[], isOpen: boolean) => {
  const [clientSearch, setClientSearch] = useState("");
  
  // Reset search when dropdown closes - immediate, no debounce
  useEffect(() => {
    if (!isOpen) {
      setClientSearch("");
    }
  }, [isOpen]);

  // Ultra-optimized filtering with no debounce for faster UI feedback
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    
    const searchTerm = clientSearch.toLowerCase().trim();
    
    // Limit to first 10 matches for better performance
    const matches: Client[] = [];
    
    // Simple, direct matching with early return for better performance
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
      
      if (fullName.includes(searchTerm) || 
          (client.telephone && client.telephone.includes(searchTerm)) || 
          client.id.toString().includes(searchTerm)) {
        matches.push(client);
        
        // Limit results for better performance
        if (matches.length >= 10) break;
      }
    }
    
    return matches;
  }, [clients, clientSearch]);

  return {
    clientSearch,
    setClientSearch,
    filteredClients
  };
};
