
import { useCallback } from 'react';
import { toast } from 'sonner';
import { formatOperationsWithDates } from './utils/operationFormatter';
import { mockOperations } from '../data/mock-operations';

/**
 * Hook that provides functions to fetch operations data
 * Always uses mock data for better performance
 */
export const useOperationsFetcher = () => {
  /**
   * Fetches all operation types synchronously without delays
   */
  const fetchAllOperations = useCallback(async () => {
    // Immediately return mock data without any delays or error simulation
    const formattedOperations = formatOperationsWithDates(mockOperations);
    
    return { 
      deposits: mockOperations.filter(op => op.type === 'deposit'), 
      withdrawals: mockOperations.filter(op => op.type === 'withdrawal'), 
      transfers: mockOperations.filter(op => op.type === 'transfer'),
      allOperations: formattedOperations 
    };
  }, []);

  return {
    fetchDeposits: async () => mockOperations.filter(op => op.type === 'deposit'),
    fetchWithdrawals: async () => mockOperations.filter(op => op.type === 'withdrawal'),
    fetchTransfers: async () => mockOperations.filter(op => op.type === 'transfer'),
    fetchAllOperations,
    cleanupAbortControllers: () => {}
  };
};
