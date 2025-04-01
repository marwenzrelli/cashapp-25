
import { supabase } from "@/integrations/supabase/client";
import { ClientOperation } from "./types";

// Define explicit interfaces for each record type
interface DepositRecord {
  id: number;
  amount: number;
  created_at: string;
  notes: string | null;
  status: string;
  client_id: number;
  client_name: string;
  operation_date: string | null;
}

interface WithdrawalRecord {
  id: number;
  amount: number;
  created_at: string;
  notes: string | null;
  status: string;
  client_name: string;
  operation_date: string | null;
}

interface TransferRecord {
  id: number;
  amount: number;
  created_at: string;
  reason: string | null;
  status: string;
  from_client: string;
  to_client: string;
  operation_date: string | null;
}

export const fetchClientOperations = async (clientName: string, token: string): Promise<ClientOperation[]> => {
  // Create abort controller for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort('Timeout');
  }, 15000);

  try {
    // For better error messages
    if (!navigator.onLine) {
      throw new Error("Vous êtes hors ligne. Vérifiez votre connexion internet.");
    }
    
    // First, retrieve client ID from the token for security check
    const accessResult = await supabase
      .from('qr_access')
      .select('client_id')
      .eq('access_token', token)
      .single();
      
    if (accessResult.error) {
      throw new Error(`Erreur d'authentification: ${accessResult.error.message}`);
    }
    
    const accessData = accessResult.data as { client_id: number } | null;
    if (!accessData || !accessData.client_id) {
      throw new Error("Token d'accès invalide");
    }
    
    // Process deposits with explicit type handling
    let depositsData: DepositRecord[] = [];
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('id, amount, created_at, notes, status, client_id, client_name, operation_date')
        .eq('client_id', accessData.client_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      depositsData = (data || []) as DepositRecord[];
    } catch (err) {
      console.error("Error in deposits query:", err);
    }
    
    // Process withdrawals with explicit type handling
    let withdrawalsData: WithdrawalRecord[] = [];
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('id, amount, created_at, notes, status, client_name, operation_date')
        .eq('client_id', accessData.client_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      withdrawalsData = (data || []) as WithdrawalRecord[];
    } catch (err) {
      console.error("Error in withdrawals query:", err);
    }
    
    // Process from-client transfers with explicit type handling
    let fromClientData: TransferRecord[] = [];
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('id, amount, created_at, reason, status, from_client, to_client, operation_date')
        .eq('from_client', clientName)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      fromClientData = (data || []) as TransferRecord[];
    } catch (err) {
      console.error("Error in from-client transfers query:", err);
    }
    
    // Process to-client transfers with explicit type handling
    let toClientData: TransferRecord[] = [];
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('id, amount, created_at, reason, status, from_client, to_client, operation_date')
        .eq('to_client', clientName)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      toClientData = (data || []) as TransferRecord[];
    } catch (err) {
      console.error("Error in to-client transfers query:", err);
    }
    
    // Combine transfers
    const transfers = [...fromClientData, ...toClientData];
    
    const combinedOperations: ClientOperation[] = [];
    
    // Map deposits to ClientOperation
    depositsData.forEach(deposit => {
      combinedOperations.push({
        id: deposit.id.toString(),
        type: 'deposit' as const,
        date: deposit.created_at,
        amount: deposit.amount,
        description: deposit.notes || 'Dépôt',
        status: deposit.status
      });
    });
    
    // Map withdrawals to ClientOperation
    withdrawalsData.forEach(withdrawal => {
      combinedOperations.push({
        id: withdrawal.id.toString(),
        type: 'withdrawal' as const,
        date: withdrawal.created_at,
        amount: withdrawal.amount,
        description: withdrawal.notes || 'Retrait',
        status: withdrawal.status
      });
    });
    
    // Map transfers to ClientOperation
    transfers.forEach(transfer => {
      const isOutgoing = transfer.from_client === clientName;
      const otherClient = isOutgoing ? transfer.to_client : transfer.from_client;
      
      combinedOperations.push({
        id: transfer.id.toString(),
        type: 'transfer' as const,
        date: transfer.created_at,
        amount: transfer.amount,
        description: transfer.reason || (isOutgoing ? `Transfert vers ${otherClient}` : `Transfert de ${otherClient}`),
        status: transfer.status,
        fromClient: isOutgoing ? clientName : otherClient,
        toClient: isOutgoing ? otherClient : clientName
      });
    });
    
    // Sort all operations by date (newest first)
    combinedOperations.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
    
    return combinedOperations;
  } catch (error: any) {
    console.error("Error fetching client operations:", error);
    
    if (error.message?.includes('AbortError') || error.name === 'AbortError') {
      throw new Error("Le délai d'attente pour charger les opérations a été dépassé. Vérifiez votre connexion internet.");
    }
    
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
