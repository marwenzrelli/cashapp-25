
import { Operation } from '../../types';

/**
 * Transforms raw data from different tables into a unified Operation format
 */
export const transformToOperations = (
  deposits: any[] = [], 
  withdrawals: any[] = [], 
  transfers: any[] = []
): Operation[] => {
  const transformedDeposits: Operation[] = deposits.map(deposit => ({
    id: deposit.id.toString(),
    type: 'deposit',
    amount: deposit.amount,
    date: deposit.created_at,
    operation_date: deposit.operation_date,
    description: deposit.notes || 'Versement',
    fromClient: deposit.client_name,
    client_id: deposit.client_id,
    status: deposit.status
  }));
  
  const transformedWithdrawals: Operation[] = withdrawals.map(withdrawal => ({
    id: withdrawal.id.toString(),
    type: 'withdrawal',
    amount: withdrawal.amount,
    date: withdrawal.created_at,
    operation_date: withdrawal.operation_date,
    description: withdrawal.notes || 'Retrait',
    fromClient: withdrawal.client_name,
    client_id: withdrawal.client_id,
    status: withdrawal.status
  }));
  
  const transformedTransfers: Operation[] = transfers.map(transfer => ({
    id: transfer.id.toString(),
    type: 'transfer',
    amount: transfer.amount,
    date: transfer.created_at,
    operation_date: transfer.operation_date,
    description: transfer.reason || 'Virement',
    fromClient: transfer.from_client,
    toClient: transfer.to_client,
    status: transfer.status
  }));

  return [...transformedDeposits, ...transformedWithdrawals, ...transformedTransfers];
};

/**
 * Deduplicates operations based on type and ID
 */
export const deduplicateOperations = (operations: Operation[]): Operation[] => {
  const uniqueMap = new Map<string, Operation>();
  operations.forEach(op => {
    const key = `${op.type}-${op.id}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, op);
    }
  });
  return Array.from(uniqueMap.values());
};

/**
 * Sorts operations by date (newest first)
 */
export const sortOperationsByDate = (operations: Operation[]): Operation[] => {
  return [...operations].sort((a, b) => {
    const dateA = new Date(a.operation_date || a.date);
    const dateB = new Date(b.operation_date || b.date);
    return dateB.getTime() - dateA.getTime();
  });
};
