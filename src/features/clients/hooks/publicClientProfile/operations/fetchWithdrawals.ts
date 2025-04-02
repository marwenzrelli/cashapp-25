
import { supabase } from "@/integrations/supabase/client";
import { WithdrawalRecord } from "./types";
import { ClientOperation } from "../types";

// Define explicit interface for the withdrawal database row to avoid deep type inference
interface WithdrawalDatabaseRow {
  id: number;
  amount: number;
  created_at: string;
  notes: string | null;
  status: string;
  client_name: string;
  operation_date: string | null;
}

export const fetchWithdrawals = async (clientId: number): Promise<WithdrawalRecord[]> => {
  try {
    const withdrawalsResult = await supabase
      .from('withdrawals')
      .select('id, amount, created_at, notes, status, client_name, operation_date')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (withdrawalsResult.error) {
      console.error("Error in withdrawals query:", withdrawalsResult.error);
      return [];
    }
    
    if (!withdrawalsResult.data) {
      return [];
    }

    // Create array first, then populate it (avoids spread operator issues)
    const withdrawalsData: WithdrawalRecord[] = [];
    
    // Use a for loop instead of map to avoid complex type inference
    for (let i = 0; i < withdrawalsResult.data.length; i++) {
      // Explicitly cast to the database row type to avoid deep type inference
      const record = withdrawalsResult.data[i] as WithdrawalDatabaseRow;
      
      // Create object with explicit property assignments
      const withdrawal: WithdrawalRecord = {
        id: record.id,
        amount: record.amount,
        created_at: record.created_at,
        notes: record.notes,
        status: record.status,
        client_name: record.client_name,
        client_id: clientId, // Add from context since it's not in the query
        operation_date: record.operation_date
      };
      withdrawalsData.push(withdrawal);
    }
    
    return withdrawalsData;
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return [];
  }
};

export const mapWithdrawalsToOperations = (withdrawals: WithdrawalRecord[]): ClientOperation[] => {
  // Create array first, then populate it (avoids spread operator issues)
  const operations: ClientOperation[] = [];
  
  // Use for loop instead of map to avoid complex type inference
  for (let i = 0; i < withdrawals.length; i++) {
    const withdrawal = withdrawals[i];
    operations.push({
      id: withdrawal.id.toString(),
      type: 'withdrawal',
      date: withdrawal.created_at,
      amount: withdrawal.amount,
      description: withdrawal.notes || 'Retrait',
      status: withdrawal.status
    });
  }
  
  return operations;
};
