
import { ClientStats } from "@/features/operations/types";

export const generateClientStats = (deposits: any[]) => {
  const clientStats: Record<string, ClientStats> = {};
  
  deposits.forEach(dep => {
    if (!dep.client_name) return;
    
    if (!clientStats[dep.client_name]) {
      clientStats[dep.client_name] = {
        totalAmount: 0,
        transactionCount: 0,
        averageAmount: 0
      };
    }
    clientStats[dep.client_name].totalAmount += dep.amount || 0;
    clientStats[dep.client_name].transactionCount += 1;
    clientStats[dep.client_name].averageAmount = 
      clientStats[dep.client_name].totalAmount / clientStats[dep.client_name].transactionCount;
  });

  return clientStats;
};

export const getTopClients = (clientStats: Record<string, ClientStats>, limit: number = 5) => {
  return Object.entries(clientStats)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
    .slice(0, limit);
};
