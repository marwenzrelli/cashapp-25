
import { Operation } from '../../types';

/**
 * Transforms raw data from different tables into a unified Operation format
 */
export const transformToOperations = (
  deposits: any[] = [], 
  withdrawals: any[] = [], 
  transfers: any[] = []
): Operation[] => {
  console.log(`Starting transformation with: ${deposits?.length || 0} deposits, ${withdrawals?.length || 0} withdrawals, ${transfers?.length || 0} transfers`);
  
  // Log a sample deposit to verify structure
  if (deposits && deposits.length > 0) {
    console.log("Sample deposit for transformation:", deposits[0]);
  }
  
  const transformedDeposits: Operation[] = deposits && Array.isArray(deposits) ? deposits.map(deposit => {
    try {
      if (!deposit) return null;
      
      // Ensure we have a valid numeric ID
      const depositId = typeof deposit.id === 'number' ? deposit.id : 
                        typeof deposit.id === 'string' ? parseInt(deposit.id, 10) : 
                        null;
      
      if (depositId === null) {
        console.warn("Invalid deposit ID:", deposit.id);
      }
      
      return {
        id: `dep-${depositId || 'unknown'}`,
        type: 'deposit' as const,
        amount: typeof deposit.amount === 'number' ? deposit.amount : 
                typeof deposit.amount === 'string' ? parseFloat(deposit.amount) : 0,
        date: deposit.created_at || deposit.date || new Date().toISOString(),
        operation_date: deposit.operation_date || deposit.created_at || deposit.date || new Date().toISOString(),
        description: deposit.description || deposit.notes || 'Versement',
        fromClient: deposit.client_name || deposit.fromClient || 'Client inconnu',
        client_id: deposit.client_id,
        status: deposit.status || 'completed'
      };
    } catch (error) {
      console.error("Error transforming deposit:", error, deposit);
      return null;
    }
  }).filter(Boolean) : [];
  
  const transformedWithdrawals: Operation[] = withdrawals && Array.isArray(withdrawals) ? withdrawals.map(withdrawal => {
    try {
      if (!withdrawal) return null;
      
      return {
        id: `wit-${withdrawal.id || 'unknown'}`,
        type: 'withdrawal' as const,
        amount: typeof withdrawal.amount === 'number' ? withdrawal.amount : 
                typeof withdrawal.amount === 'string' ? parseFloat(withdrawal.amount) : 0,
        date: withdrawal.created_at || withdrawal.date || new Date().toISOString(),
        operation_date: withdrawal.operation_date || withdrawal.created_at || withdrawal.date || new Date().toISOString(),
        description: withdrawal.notes || withdrawal.description || 'Retrait',
        fromClient: withdrawal.client_name || withdrawal.fromClient || 'Client inconnu',
        client_id: withdrawal.client_id,
        status: withdrawal.status || 'completed'
      };
    } catch (error) {
      console.error("Error transforming withdrawal:", error, withdrawal);
      return null;
    }
  }).filter(Boolean) : [];
  
  const transformedTransfers: Operation[] = transfers && Array.isArray(transfers) ? transfers.map(transfer => {
    try {
      if (!transfer) return null;
      
      return {
        id: `tra-${transfer.id || 'unknown'}`,
        type: 'transfer' as const,
        amount: typeof transfer.amount === 'number' ? transfer.amount :
                typeof transfer.amount === 'string' ? parseFloat(transfer.amount) : 0,
        date: transfer.created_at || transfer.date || new Date().toISOString(),
        operation_date: transfer.operation_date || transfer.created_at || transfer.date || new Date().toISOString(),
        description: transfer.reason || transfer.description || 'Virement',
        fromClient: transfer.from_client || transfer.fromClient || 'Client inconnu',
        toClient: transfer.to_client || transfer.toClient || 'Client inconnu',
        status: transfer.status || 'completed'
      };
    } catch (error) {
      console.error("Error transforming transfer:", error, transfer);
      return null;
    }
  }).filter(Boolean) : [];

  console.log(`Transformed counts: ${transformedDeposits.length} deposits, ${transformedWithdrawals.length} withdrawals, ${transformedTransfers.length} transfers`);
  
  return [...transformedDeposits, ...transformedWithdrawals, ...transformedTransfers];
};

/**
 * Deduplicates operations based on type and ID
 */
export const deduplicateOperations = (operations: Operation[]): Operation[] => {
  if (!operations || operations.length === 0) return [];
  
  const uniqueMap = new Map<string, Operation>();
  operations.forEach(op => {
    if (!op) return;
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
  if (!operations || operations.length === 0) return [];
  
  return [...operations].sort((a, b) => {
    if (!a || !b) return 0;
    const dateA = new Date(a.operation_date || a.date);
    const dateB = new Date(b.operation_date || b.date);
    return dateB.getTime() - dateA.getTime();
  });
};
