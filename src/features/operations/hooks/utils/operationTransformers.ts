
import { Operation } from '../../types';

/**
 * Transforms raw data from different tables into a unified Operation format
 */
export const transformToOperations = (
  deposits: any[] = [], 
  withdrawals: any[] = [], 
  transfers: any[] = []
): Operation[] => {
  console.log(`Starting transformation with: ${deposits.length} deposits, ${withdrawals.length} withdrawals, ${transfers.length} transfers`);
  
  // Log a sample deposit to verify structure
  if (deposits.length > 0) {
    console.log("Sample deposit for transformation:", deposits[0]);
  }
  
  const transformedDeposits: Operation[] = deposits.map(deposit => {
    try {
      if (!deposit) return null;
      
      return {
        id: (deposit.id || '').toString(),
        type: 'deposit' as const,
        amount: deposit.amount || 0,
        date: deposit.created_at || new Date().toISOString(),
        operation_date: deposit.operation_date || deposit.created_at || new Date().toISOString(),
        description: deposit.notes || 'Versement',
        fromClient: deposit.client_name || 'Client inconnu',
        client_id: deposit.client_id,
        status: deposit.status || 'completed'
      };
    } catch (error) {
      console.error("Error transforming deposit:", error, deposit);
      return null;
    }
  }).filter(Boolean);
  
  const transformedWithdrawals: Operation[] = withdrawals.map(withdrawal => {
    try {
      if (!withdrawal) return null;
      
      return {
        id: (withdrawal.id || '').toString(),
        type: 'withdrawal' as const,
        amount: withdrawal.amount || 0,
        date: withdrawal.created_at || new Date().toISOString(),
        operation_date: withdrawal.operation_date || withdrawal.created_at || new Date().toISOString(),
        description: withdrawal.notes || 'Retrait',
        fromClient: withdrawal.client_name || 'Client inconnu',
        client_id: withdrawal.client_id,
        status: withdrawal.status || 'completed'
      };
    } catch (error) {
      console.error("Error transforming withdrawal:", error, withdrawal);
      return null;
    }
  }).filter(Boolean);
  
  const transformedTransfers: Operation[] = transfers.map(transfer => {
    try {
      if (!transfer) return null;
      
      return {
        id: (transfer.id || '').toString(),
        type: 'transfer' as const,
        amount: transfer.amount || 0,
        date: transfer.created_at || new Date().toISOString(),
        operation_date: transfer.operation_date || transfer.created_at || new Date().toISOString(),
        description: transfer.reason || 'Virement',
        fromClient: transfer.from_client || 'Client inconnu',
        toClient: transfer.to_client || 'Client inconnu',
        status: transfer.status || 'completed'
      };
    } catch (error) {
      console.error("Error transforming transfer:", error, transfer);
      return null;
    }
  }).filter(Boolean);

  console.log(`Transformed counts: ${transformedDeposits.length} deposits, ${transformedWithdrawals.length} withdrawals, ${transformedTransfers.length} transfers`);
  
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
