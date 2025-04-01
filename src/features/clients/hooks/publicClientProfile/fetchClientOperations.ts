
import { supabase } from "@/integrations/supabase/client";
import { ClientOperation } from "./types";

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
    
    // Simplified query approach with explicit type declarations
    
    // Fetch deposits
    const depositsResponse = await supabase
      .from('deposits')
      .select('id, amount, created_at, notes, status, client_id, client_name, operation_date')
      .eq('client_id', accessData.client_id)
      .order('created_at', { ascending: false });
      
    const deposits = depositsResponse.data || [];
    const depositsError = depositsResponse.error;
      
    // Fetch withdrawals
    const withdrawalsResponse = await supabase
      .from('withdrawals')
      .select('id, amount, created_at, notes, status, client_name, operation_date')
      .eq('client_id', accessData.client_id)
      .order('created_at', { ascending: false });
      
    const withdrawals = withdrawalsResponse.data || [];
    const withdrawalsError = withdrawalsResponse.error;
      
    // Fetch transfers
    const transfersResponse = await supabase
      .from('transfers')
      .select('id, amount, created_at, reason, status, from_client, to_client, operation_date')
      .or(`from_client.eq.${clientName},to_client.eq.${clientName}`)
      .order('created_at', { ascending: false });
    
    const transfers = transfersResponse.data || [];
    const transfersError = transfersResponse.error;
    
    // Log any errors
    if (depositsError) console.error("Error fetching deposits:", depositsError);
    if (withdrawalsError) console.error("Error fetching withdrawals:", withdrawalsError);
    if (transfersError) console.error("Error fetching transfers:", transfersError);
    
    const combinedOperations: ClientOperation[] = [];
    
    // Format deposits
    deposits.forEach(deposit => {
      combinedOperations.push({
        id: deposit.id.toString(),
        type: 'deposit' as const,
        date: deposit.created_at,
        amount: deposit.amount,
        description: deposit.notes || 'Dépôt',
        status: deposit.status
      });
    });
    
    // Format withdrawals
    withdrawals.forEach(withdrawal => {
      combinedOperations.push({
        id: withdrawal.id.toString(),
        type: 'withdrawal' as const,
        date: withdrawal.created_at,
        amount: withdrawal.amount,
        description: withdrawal.notes || 'Retrait',
        status: withdrawal.status
      });
    });
    
    // Format transfers
    transfers.forEach(transfer => {
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
