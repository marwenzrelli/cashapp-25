
import { ClientStats } from "@/features/operations/types";

export const generateClientStats = (deposits: any[]) => {
  const clientStats: Record<string, ClientStats> = {};
  
  if (!Array.isArray(deposits)) {
    console.warn("Invalid deposits data:", deposits);
    return clientStats;
  }
  
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

  return clientStats;
};

export const getTopClients = (clientStats: Record<string, ClientStats>, limit: number = 5) => {
  if (!clientStats || typeof clientStats !== 'object' || Object.keys(clientStats).length === 0) {
    return [];
  }
  
  return Object.entries(clientStats)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
    .slice(0, limit);
};
