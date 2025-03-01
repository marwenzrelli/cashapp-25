
import { Client } from "@/features/clients/types";

export const useClientLookup = (clients: Client[]) => {
  const findClientById = (clientFullName: string): (Client & { dateCreation: string }) | null => {
    if (!clientFullName) return null;
    
    const [firstName, lastName] = clientFullName.split(' ');
    
    const client = clients.find(c => 
      c.prenom.toLowerCase() === firstName?.toLowerCase() && 
      c.nom.toLowerCase() === lastName?.toLowerCase()
    );
    
    if (client) {
      return {
        ...client,
        dateCreation: client.date_creation || new Date().toISOString()
      };
    }
    
    const fallbackClient = clients.find(c => 
      `${c.prenom} ${c.nom}`.toLowerCase().includes(clientFullName.toLowerCase())
    );
    
    if (fallbackClient) {
      return {
        ...fallbackClient,
        dateCreation: fallbackClient.date_creation || new Date().toISOString()
      };
    }
    
    return null;
  };

  return { findClientById };
};
