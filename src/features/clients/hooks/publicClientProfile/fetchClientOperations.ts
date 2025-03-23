
import { ClientOperation } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const fetchClientOperations = async (clientName: string, token: string): Promise<ClientOperation[]> => {
  try {
    // Fetch deposits
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .eq('client_name', clientName)
      .order('created_at', { ascending: false });

    if (depositsError) {
      console.error("Error fetching deposits:", depositsError);
      // Continue execution to at least try to get withdrawals
    }

    // Fetch withdrawals
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('client_name', clientName)
      .order('created_at', { ascending: false });

    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError);
      // Continue execution to return at least deposits if available
    }

    // Combine and format the operations
    const operations: ClientOperation[] = [];

    // Add deposits
    if (deposits) {
      deposits.forEach(deposit => {
        operations.push({
          id: `deposit-${deposit.id}`,
          type: 'deposit',
          amount: deposit.amount,
          date: deposit.created_at,
          description: deposit.notes || 'Versement',
          status: deposit.status
        });
      });
    }

    // Add withdrawals
    if (withdrawals) {
      withdrawals.forEach(withdrawal => {
        operations.push({
          id: `withdrawal-${withdrawal.id}`,
          type: 'withdrawal',
          amount: withdrawal.amount,
          date: withdrawal.created_at,
          description: withdrawal.notes || 'Retrait',
          status: withdrawal.status
        });
      });
    }

    // Sort by date, newest first
    operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return operations;
  } catch (error: any) {
    console.error("Error fetching client operations:", error);
    // Return empty array instead of throwing to avoid blocking the UI
    return [];
  }
};
