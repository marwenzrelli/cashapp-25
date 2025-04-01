
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
    const { data: accessData, error: accessError } = await supabase
      .from('qr_access')
      .select('client_id')
      .eq('access_token', token)
      .single();
      
    if (accessError) {
      throw new Error(`Erreur d'authentification: ${accessError.message}`);
    }
    
    if (!accessData || !accessData.client_id) {
      throw new Error("Token d'accès invalide");
    }
    
    // Fetch deposits - use explicit type to avoid deep type instantiation
    const depositsQuery = await supabase
      .from('deposits')
      .select('*')
      .eq('client_id', accessData.client_id)
      .order('created_at', { ascending: false });
      
    const deposits = depositsQuery.data || [];
    const depositsError = depositsQuery.error;
    
    if (depositsError) {
      console.error("Error fetching deposits:", depositsError);
    }
    
    // Fetch withdrawals - use explicit type to avoid deep type instantiation
    const withdrawalsQuery = await supabase
      .from('withdrawals')
      .select('*')
      .eq('client_id', accessData.client_id)
      .order('created_at', { ascending: false });
      
    const withdrawals = withdrawalsQuery.data || [];
    const withdrawalsError = withdrawalsQuery.error;
    
    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError);
    }
    
    // Fetch transfers - use explicit type to avoid deep type instantiation
    const transfersQuery = await supabase
      .from('transfers')
      .select('*')
      .or(`from_client.eq.${clientName},to_client.eq.${clientName}`)
      .order('created_at', { ascending: false });
      
    const transfers = transfersQuery.data || [];
    const transfersError = transfersQuery.error;
    
    if (transfersError) {
      console.error("Error fetching transfers:", transfersError);
    }
    
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
