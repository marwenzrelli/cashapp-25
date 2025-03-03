
import { useState, useEffect } from "react";
import { type Client } from "@/features/clients/types";

export const useClientFilter = (clients: Client[], isOpen: boolean) => {
  const [clientSearch, setClientSearch] = useState("");
  
  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setClientSearch("");
    }
  }, [isOpen]);

  // Filter clients based on search
  const filteredClients = clients.filter(client => {
    if (!clientSearch.trim()) return true;
    const fullName = `${client.prenom} ${client.nom}`.toLowerCase();
    const searchTerm = clientSearch.toLowerCase().trim();

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
