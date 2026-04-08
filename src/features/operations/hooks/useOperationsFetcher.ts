
import { useCallback } from 'react';
import { Operation } from '../types';
import { fetchAllRows } from '@/features/statistics/utils/fetchAllRows';
import { logger } from '@/utils/logger';

export const useOperationsFetcher = () => {
  const getOperations = useCallback(async (_cacheBuster = '') => {
    const operations: Operation[] = [];
    
    const [depositsData, withdrawalsData, transfersData] = await Promise.all([
      fetchAllRows('deposits', { orderBy: 'created_at', ascending: false }),
      fetchAllRows('withdrawals', { orderBy: 'created_at', ascending: false }),
      fetchAllRows('transfers', { orderBy: 'created_at', ascending: false })
    ]);

    // Process deposits
    if (depositsData) {
      operations.push(...depositsData.map((deposit: any) => ({
        id: `dep-${deposit.id}`,
        type: 'deposit' as const,
        date: deposit.operation_date ? new Date(deposit.operation_date).toISOString() : new Date(deposit.created_at).toISOString(),
        operation_date: deposit.operation_date,
        fromClient: deposit.client_name,
        amount: Number(deposit.amount),
        description: deposit.notes || '',
        status: deposit.status || 'completed',
        createdAt: deposit.created_at
      })));
    }
    
    // Process withdrawals
    if (withdrawalsData) {
      operations.push(...withdrawalsData.map((withdrawal: any) => ({
        id: `wit-${withdrawal.id}`,
        type: 'withdrawal' as const,
        date: withdrawal.operation_date ? new Date(withdrawal.operation_date).toISOString() : new Date(withdrawal.created_at).toISOString(),
        operation_date: withdrawal.operation_date,
        fromClient: withdrawal.client_name,
        amount: Number(withdrawal.amount),
        description: withdrawal.notes || '',
        status: withdrawal.status || 'completed',
        createdAt: withdrawal.created_at
      })));
    }
    
    // Process transfers
    if (transfersData) {
      operations.push(...transfersData.map((transfer: any) => ({
        id: `tra-${transfer.id}`,
        type: 'transfer' as const,
        date: transfer.operation_date ? new Date(transfer.operation_date).toISOString() : new Date(transfer.created_at).toISOString(),
        operation_date: transfer.operation_date,
        fromClient: transfer.from_client,
        toClient: transfer.to_client,
        amount: Number(transfer.amount),
        description: transfer.reason || '',
        status: transfer.status || 'completed',
        createdAt: transfer.created_at
      })));
    }
    
    logger.log(`Loaded ${operations.length} operations`);
    
    return operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);
  
  return { getOperations };
};
