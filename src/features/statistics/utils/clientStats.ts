
import { ClientStats } from "@/features/operations/types";

/**
 * Generates statistics for each client based on deposit data
 */
export const generateClientStats = (deposits: any[]) => {
  const clientStats: Record<string, ClientStats> = {};
  
  // Check if we have valid deposit data
  if (!Array.isArray(deposits) || deposits.length === 0) {
    console.warn("No valid deposits data available for client stats");
    
    // Demo data for testing when no real data is available
    if (process.env.NODE_ENV === 'development') {
      return {
        "Client A": { totalAmount: 250000, transactionCount: 5, averageAmount: 50000 },
        "Client B": { totalAmount: 175000, transactionCount: 7, averageAmount: 25000 },
        "Client C": { totalAmount: 120000, transactionCount: 4, averageAmount: 30000 },
        "Client D": { totalAmount: 80000, transactionCount: 2, averageAmount: 40000 },
        "Client E": { totalAmount: 50000, transactionCount: 1, averageAmount: 50000 }
      };
    }
    
    return clientStats;
  }
  
  console.log(`Processing ${deposits.length} deposits for client statistics`);
  
  deposits.forEach(dep => {
    if (!dep || !dep.client_name) return;
    
    if (!clientStats[dep.client_name]) {
      clientStats[dep.client_name] = {
        totalAmount: 0,
        transactionCount: 0,
        averageAmount: 0
      };
    }
    
    // Safely add to total amount
    const amount = Number(dep.amount) || 0;
    clientStats[dep.client_name].totalAmount += amount;
    clientStats[dep.client_name].transactionCount += 1;
    clientStats[dep.client_name].averageAmount = 
      clientStats[dep.client_name].totalAmount / clientStats[dep.client_name].transactionCount;
  });

  console.log("Generated client stats for", Object.keys(clientStats).length, "clients");
  return clientStats;
};

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
