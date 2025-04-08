
import { useCallback } from 'react';
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
  const fetchAllOperations = useCallback(() => {
    // Return mock data immediately - no async needed for better performance
    const formattedOperations = formatOperationsWithDates(mockOperations);
    
    return { 
      deposits: mockOperations.filter(op => op.type === 'deposit'), 
      withdrawals: mockOperations.filter(op => op.type === 'withdrawal'), 
      transfers: mockOperations.filter(op => op.type === 'transfer'),
      allOperations: formattedOperations 
    };
  }, []);

  return {
    // Convert to sync functions for better performance
    fetchDeposits: () => mockOperations.filter(op => op.type === 'deposit'),
    fetchWithdrawals: () => mockOperations.filter(op => op.type === 'withdrawal'),
    fetchTransfers: () => mockOperations.filter(op => op.type === 'transfer'),
    fetchAllOperations,
    cleanupAbortControllers: () => {}
  };
};
