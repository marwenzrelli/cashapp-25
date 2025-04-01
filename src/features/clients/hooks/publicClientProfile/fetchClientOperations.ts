
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
    
    const accessData = accessResult.data;
    if (!accessData || !accessData.client_id) {
      throw new Error("Token d'accès invalide");
    }
    
    // Use type annotations for all query results to avoid deep type inference
    const { data: depositsData, error: depositsError } = await supabase
      .from('deposits')
      .select('id, amount, created_at, notes, status, client_id, client_name, operation_date')
      .eq('client_id', accessData.client_id)
      .order('created_at', { ascending: false });
      
    const { data: withdrawalsData, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('id, amount, created_at, notes, status, client_name, operation_date')
      .eq('client_id', accessData.client_id)
      .order('created_at', { ascending: false });
      
    // Split transfer queries to simplify type handling
    const { data: fromClientData, error: fromClientError } = await supabase
      .from('transfers')
      .select('id, amount, created_at, reason, status, from_client, to_client, operation_date')
      .eq('from_client', clientName)
      .order('created_at', { ascending: false });
      
    const { data: toClientData, error: toClientError } = await supabase
      .from('transfers')
      .select('id, amount, created_at, reason, status, from_client, to_client, operation_date')
      .eq('to_client', clientName)
      .order('created_at', { ascending: false });
    
    // Manually type the query results to break complex type inference
    const deposits: DepositRecord[] = depositsData || [];
    const withdrawals: WithdrawalRecord[] = withdrawalsData || [];
    const fromTransfers: TransferRecord[] = fromClientData || [];
    const toTransfers: TransferRecord[] = toClientData || [];
    
    // Merge transfer results
    const transfers = [...fromTransfers, ...toTransfers];
    
    // Log any errors
    if (depositsError) console.error("Error fetching deposits:", depositsError);
    if (withdrawalsError) console.error("Error fetching withdrawals:", withdrawalsError);
    if (fromClientError) console.error("Error fetching from_client transfers:", fromClientError);
    if (toClientError) console.error("Error fetching to_client transfers:", toClientError);
    
    const combinedOperations: ClientOperation[] = [];
    
    // Process deposits
    for (const deposit of deposits) {
      combinedOperations.push({
        id: deposit.id.toString(),
        type: 'deposit' as const,
        date: deposit.created_at,
        amount: deposit.amount,
        description: deposit.notes || 'Dépôt',
        status: deposit.status
      });
    }
    
    // Process withdrawals
    for (const withdrawal of withdrawals) {
      combinedOperations.push({
        id: withdrawal.id.toString(),
        type: 'withdrawal' as const,
        date: withdrawal.created_at,
        amount: withdrawal.amount,
        description: withdrawal.notes || 'Retrait',
        status: withdrawal.status
      });
    }
    
    // Process transfers
    for (const transfer of transfers) {
      // Determine if this is an outgoing transfer for the current client
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
    }
    
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
