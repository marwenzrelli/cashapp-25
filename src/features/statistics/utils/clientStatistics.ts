
import { ClientStats } from "@/features/operations/types";

/**
 * Generates statistics for each client based on operation data
 */
export const generateClientStats = (operations: any[]) => {
  const clientStats: Record<string, ClientStats> = {};
  
  // Check if we have valid operations data
  if (!Array.isArray(operations) || operations.length === 0) {
    console.warn("No valid operations data available for client stats");
    
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
  
  console.log(`Processing ${operations.length} operations for client statistics`);
  
  operations.forEach(op => {
    // Skip invalid operations
    if (!op) return;
    
    // Handle different operation types
    const clientName = op.client_name || op.fromClient;
    if (!clientName) return;
    
    if (!clientStats[clientName]) {
      clientStats[clientName] = {
        totalAmount: 0,
        transactionCount: 0,
        averageAmount: 0
      };
    }
    
    // Safely add to total amount
    const amount = Number(op.amount) || 0;
    clientStats[clientName].totalAmount += amount;
    clientStats[clientName].transactionCount += 1;
    clientStats[clientName].averageAmount = 
      clientStats[clientName].totalAmount / clientStats[clientName].transactionCount;
  });

  console.log("Generated client stats for", Object.keys(clientStats).length, "clients");
  return clientStats;
};
