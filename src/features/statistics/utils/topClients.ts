
import { ClientStats } from "@/features/operations/types";

/**
 * Returns the top clients based on total amount
 */
export const getTopClients = (clientStats: Record<string, ClientStats>, limit: number = 5) => {
  if (!clientStats || typeof clientStats !== 'object') {
    console.warn("No client stats object provided for top clients");
    return [];
  }
  
  const clientKeys = Object.keys(clientStats);
  
  if (clientKeys.length === 0) {
    console.warn("Client stats object is empty, no clients to display");
    return [];
  }
  
  console.log(`Found ${clientKeys.length} clients in stats data`);
  
  const sorted = Object.entries(clientStats)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
    .slice(0, limit);
    
  console.log("Top clients sorted:", sorted.map(([name, stats]) => `${name}: ${stats.totalAmount}`));
  return sorted;
};
