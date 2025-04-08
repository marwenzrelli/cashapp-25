
import { useState, useEffect, useMemo } from "react";
import { type Client } from "@/features/clients/types";

export const useClientFilter = (clients: Client[], isOpen: boolean) => {
  const [clientSearch, setClientSearch] = useState("");
  
  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setClientSearch("");
    }
  }, [isOpen]);

  // Filtrage optimisé avec limite de résultats
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients.slice(0, 50); // Limiter à 50 résultats par défaut
    
    const searchTerm = clientSearch.toLowerCase().trim();
    const matches: Client[] = [];
    
    // Recherche directe avec limite de résultats
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
      
      if (fullName.includes(searchTerm) || 
          (client.telephone && client.telephone.includes(searchTerm)) || 
          client.id.toString().includes(searchTerm)) {
        matches.push(client);
        if (matches.length >= 10) break; // Limiter à 10 résultats pour la recherche
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
