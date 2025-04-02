
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
    // Create simple query with explicit type for data
    const { data, error } = await supabase
      .from('withdrawals')
      .select('id, amount, created_at, notes, status, client_name, operation_date')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error in withdrawals query:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }

    // Cast the data to our explicit interface to avoid deep inference
    const typedData = data as WithdrawalDatabaseRow[];
    
    // Create array first, then populate it (avoids spread operator issues)
    const withdrawalsData: WithdrawalRecord[] = [];
    
    // Use a for loop instead of map to avoid complex type inference
    for (let i = 0; i < typedData.length; i++) {
      const row = typedData[i];
      // Manually create each withdrawal record with explicit assignments
      const withdrawal: WithdrawalRecord = {
        id: row.id,
        amount: row.amount,
        created_at: row.created_at,
        notes: row.notes,
        status: row.status,
        client_name: row.client_name,
        client_id: clientId,
        operation_date: row.operation_date
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
