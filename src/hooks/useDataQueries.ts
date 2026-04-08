import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllRows } from "@/features/statistics/utils/fetchAllRows";
import { logger } from "@/utils/logger";

// Query keys for cache management
export const queryKeys = {
  deposits: ['deposits'] as const,
  withdrawals: ['withdrawals'] as const,
  transfers: ['transfers'] as const,
  directOperations: ['direct_operations'] as const,
  clients: ['clients'] as const,
};

// Shared hooks for fetching data with React Query caching
export const useDepositsQuery = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.deposits,
    queryFn: async () => {
      const data = await fetchAllRows('deposits', { orderBy: 'created_at', ascending: false });
      logger.log(`Cache: fetched ${data.length} deposits`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled,
  });
};

export const useWithdrawalsQuery = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.withdrawals,
    queryFn: async () => {
      const data = await fetchAllRows('withdrawals', { orderBy: 'created_at', ascending: false });
      logger.log(`Cache: fetched ${data.length} withdrawals`);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

export const useTransfersQuery = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.transfers,
    queryFn: async () => {
      const data = await fetchAllRows('transfers', { orderBy: 'created_at', ascending: false });
      logger.log(`Cache: fetched ${data.length} transfers`);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

export const useDirectOperationsQuery = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.directOperations,
    queryFn: async () => {
      const data = await fetchAllRows('direct_operations', { orderBy: 'operation_date', ascending: false });
      logger.log(`Cache: fetched ${data.length} direct operations`);
      return data;
    },
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};

// Hook to invalidate all operation caches (use after mutations)
export const useInvalidateOperations = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deposits });
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals });
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers });
      queryClient.invalidateQueries({ queryKey: queryKeys.directOperations });
    },
    invalidateDeposits: () => queryClient.invalidateQueries({ queryKey: queryKeys.deposits }),
    invalidateWithdrawals: () => queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals }),
    invalidateTransfers: () => queryClient.invalidateQueries({ queryKey: queryKeys.transfers }),
    invalidateDirectOperations: () => queryClient.invalidateQueries({ queryKey: queryKeys.directOperations }),
  };
};
