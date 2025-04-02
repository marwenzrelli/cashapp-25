
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
    // Completely simplify the query and type handling
    const query = supabase
      .from('withdrawals')
      .select('id, amount, created_at, notes, status, client_name, operation_date')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
      
    // Execute the query separately to avoid deep type inference
    const { data, error } = await query;
    
    if (error) {
      console.error("Error in withdrawals query:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }

    // Create array first, then populate it (avoids spread operator issues)
    const withdrawalsData: WithdrawalRecord[] = [];
    
    // Use a for loop instead of map to avoid complex type inference
    for (let i = 0; i < data.length; i++) {
      // Manually create each withdrawal record with explicit assignments
      const withdrawal: WithdrawalRecord = {
        id: data[i].id,
        amount: data[i].amount,
        created_at: data[i].created_at,
        notes: data[i].notes,
        status: data[i].status,
        client_name: data[i].client_name,
        client_id: clientId,
        operation_date: data[i].operation_date
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
