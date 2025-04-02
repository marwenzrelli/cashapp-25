
import { supabase } from "@/integrations/supabase/client";
import { WithdrawalRecord } from "./types";
import { ClientOperation } from "../types";

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

    // Map to proper typed records
    const withdrawalsData: WithdrawalRecord[] = [];
    for (let i = 0; i < withdrawalsResult.data.length; i++) {
      const withdrawal: WithdrawalRecord = {
        id: withdrawalsResult.data[i].id,
        amount: withdrawalsResult.data[i].amount,
        created_at: withdrawalsResult.data[i].created_at,
        notes: withdrawalsResult.data[i].notes,
        status: withdrawalsResult.data[i].status,
        client_name: withdrawalsResult.data[i].client_name,
        client_id: clientId, // Add from context since it's not in the query
        operation_date: withdrawalsResult.data[i].operation_date
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
  const operations: ClientOperation[] = [];
  
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
