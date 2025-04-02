
import { supabase } from "@/integrations/supabase/client";
import { DepositRecord } from "./types";
import { ClientOperation } from "../types";

export const fetchDeposits = async (clientId: number): Promise<DepositRecord[]> => {
  try {
    const depositsResult = await supabase
      .from('deposits')
      .select('id, amount, created_at, notes, status, client_id, client_name, operation_date')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (depositsResult.error) {
      console.error("Error in deposits query:", depositsResult.error);
      return [];
    }
    
    if (!depositsResult.data) {
      return [];
    }

    // Map to proper typed records
    const depositsData: DepositRecord[] = [];
    for (let i = 0; i < depositsResult.data.length; i++) {
      const deposit: DepositRecord = {
        id: depositsResult.data[i].id,
        amount: depositsResult.data[i].amount,
        created_at: depositsResult.data[i].created_at,
        notes: depositsResult.data[i].notes,
        status: depositsResult.data[i].status,
        client_id: depositsResult.data[i].client_id,
        client_name: depositsResult.data[i].client_name,
        operation_date: depositsResult.data[i].operation_date
      };
      depositsData.push(deposit);
    }
    
    return depositsData;
  } catch (error) {
    console.error("Error fetching deposits:", error);
    return [];
  }
};

export const mapDepositsToOperations = (deposits: DepositRecord[]): ClientOperation[] => {
  const operations: ClientOperation[] = [];
  
  for (let i = 0; i < deposits.length; i++) {
    const deposit = deposits[i];
    operations.push({
      id: deposit.id.toString(),
      type: 'deposit',
      date: deposit.created_at,
      amount: deposit.amount,
      description: deposit.notes || 'Dépôt',
      status: deposit.status
    });
  }
  
  return operations;
};
