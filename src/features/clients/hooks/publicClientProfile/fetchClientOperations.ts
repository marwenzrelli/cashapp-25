
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
    
    // Use simple function to fetch data to avoid complex type issues
    async function fetchDeposits() {
      return await supabase
        .from('deposits')
        .select('id, amount, created_at, notes, status, client_id, client_name, operation_date')
        .eq('client_id', accessData.client_id)
        .order('created_at', { ascending: false });
    }
    
    async function fetchWithdrawals() {
      return await supabase
        .from('withdrawals')
        .select('id, amount, created_at, notes, status, client_name, operation_date')
        .eq('client_id', accessData.client_id)
        .order('created_at', { ascending: false });
    }
    
    async function fetchTransfers() {
      return await supabase
        .from('transfers')
        .select('id, amount, created_at, reason, status, from_client, to_client, operation_date')
        .or(`from_client.eq.${clientName},to_client.eq.${clientName}`)
        .order('created_at', { ascending: false });
    }
    
    // Execute queries
    const depositsResult = await fetchDeposits();
    const withdrawalsResult = await fetchWithdrawals();
    const transfersResult = await fetchTransfers();
    
    // Handle results
    const deposits = depositsResult.data || [];
    const withdrawals = withdrawalsResult.data || [];
    const transfers = transfersResult.data || [];
    
    // Log any errors
    if (depositsResult.error) console.error("Error fetching deposits:", depositsResult.error);
    if (withdrawalsResult.error) console.error("Error fetching withdrawals:", withdrawalsResult.error);
    if (transfersResult.error) console.error("Error fetching transfers:", transfersResult.error);
    
    const combinedOperations: ClientOperation[] = [];
    
    // Format deposits
    if (deposits) {
      combinedOperations.push(
        ...deposits.map(deposit => ({
          id: deposit.id.toString(),
          type: 'deposit' as const,
          date: deposit.created_at,
          amount: deposit.amount,
          description: deposit.notes || 'Dépôt', // Using notes field instead of description
          status: deposit.status
        }))
      );
    }
    
    // Format withdrawals
    if (withdrawals) {
      combinedOperations.push(
        ...withdrawals.map(withdrawal => ({
          id: withdrawal.id.toString(),
          type: 'withdrawal' as const,
          date: withdrawal.created_at,
          amount: withdrawal.amount,
          description: withdrawal.notes || 'Retrait', // Using notes field instead of description
          status: withdrawal.status
        }))
      );
    }
    
    // Format transfers - simplified to avoid relation issues
    if (transfers) {
      combinedOperations.push(
        ...transfers.map(transfer => {
          // Determine if this is an outgoing transfer for the current client
          const isOutgoing = transfer.from_client === clientName;
          const otherClient = isOutgoing ? transfer.to_client : transfer.from_client;
              
          return {
            id: transfer.id.toString(),
            type: 'transfer' as const,
            date: transfer.created_at,
            amount: transfer.amount,
            description: transfer.reason || (isOutgoing ? `Transfert vers ${otherClient}` : `Transfert de ${otherClient}`),
            status: transfer.status,
            fromClient: isOutgoing ? clientName : otherClient,
            toClient: isOutgoing ? otherClient : clientName
          };
        })
      );
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
