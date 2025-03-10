
import { ClientStats } from "@/features/operations/types";

/**
 * Returns the top clients based on total amount
 */
export const getTopClients = (clientStats: Record<string, ClientStats>, limit: number = 5) => {
  if (!clientStats || typeof clientStats !== 'object' || Object.keys(clientStats).length === 0) {
    console.warn("No client stats available for top clients");
    return [];
  }
  
  const sorted = Object.entries(clientStats)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
    .slice(0, limit);
    
  console.log("Top clients:", sorted.map(([name]) => name));
  return sorted;
};
