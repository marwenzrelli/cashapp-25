
import { useCallback } from 'react';
import { toast } from 'sonner';
import { formatOperationsWithDates } from './utils/operationFormatter';
import { mockOperations } from '../data/mock-operations';

/**
 * Hook that provides functions to fetch operations data
 * Simplified to always use mock data for better performance
 */
export const useOperationsFetcher = () => {
  /**
   * Fetches all operation types
   */
  const fetchAllOperations = useCallback(async () => {
    try {
      console.log('Starting fetchAllOperations...');
      
      // Always use test data for demonstration and best performance
      console.log('Using mock data for all operations');
      const formattedOperations = formatOperationsWithDates(mockOperations);
      
      return { 
        deposits: mockOperations.filter(op => op.type === 'deposit'), 
        withdrawals: mockOperations.filter(op => op.type === 'withdrawal'), 
        transfers: mockOperations.filter(op => op.type === 'transfer'),
        allOperations: formattedOperations 
      };
    } catch (error) {
      console.error('Error in fetchAllOperations:', error);
      
      // Even in case of error, return mock data
      const formattedOperations = formatOperationsWithDates(mockOperations);
      
      return { 
        deposits: mockOperations.filter(op => op.type === 'deposit'), 
        withdrawals: mockOperations.filter(op => op.type === 'withdrawal'), 
        transfers: mockOperations.filter(op => op.type === 'transfer'),
        allOperations: formattedOperations 
      };
    }
  }, []);

  return {
    fetchDeposits: async () => mockOperations.filter(op => op.type === 'deposit'),
    fetchWithdrawals: async () => mockOperations.filter(op => op.type === 'withdrawal'),
    fetchTransfers: async () => mockOperations.filter(op => op.type === 'transfer'),
    fetchAllOperations,
    cleanupAbortControllers: () => {}
  };
};
