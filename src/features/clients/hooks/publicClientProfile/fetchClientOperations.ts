
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
    
    // Use Promise.all to fetch all operations in parallel
    const [depositsPromise, withdrawalsPromise, transfersPromise] = [
      supabase
        .from('deposits')
        .select('*')
        .eq('client_id', accessData.client_id)
        .order('created_at', { ascending: false }),
        
      supabase
        .from('withdrawals')
        .select('*')
        .eq('client_id', accessData.client_id)
        .order('created_at', { ascending: false }),
        
      supabase
        .from('transfers')
        .select('*, to_clients(*), from_clients(*)')
        .or(`from_client_id.eq.${accessData.client_id},to_client_id.eq.${accessData.client_id}`)
        .order('created_at', { ascending: false })
    ];
    
    // Execute all requests in parallel
    const [
      { data: deposits, error: depositsError },
      { data: withdrawals, error: withdrawalsError },
      { data: transfers, error: transfersError }
    ] = await Promise.all([depositsPromise, withdrawalsPromise, transfersPromise]);
    
    // Handle errors
    if (depositsError) console.error("Error fetching deposits:", depositsError);
    if (withdrawalsError) console.error("Error fetching withdrawals:", withdrawalsError);
    if (transfersError) console.error("Error fetching transfers:", transfersError);
    
    const combinedOperations: ClientOperation[] = [];
    
    // Format deposits
    if (deposits) {
      combinedOperations.push(
        ...deposits.map(deposit => ({
          id: deposit.id.toString(),
          type: 'deposit' as const,
          date: deposit.created_at,
          amount: deposit.amount,
          description: deposit.description || 'Dépôt',
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
          description: withdrawal.description || 'Retrait',
          status: withdrawal.status
        }))
      );
    }
    
    // Format transfers - more complex as we need to handle both incoming and outgoing
    if (transfers) {
      combinedOperations.push(
        ...transfers.map(transfer => {
          const isOutgoing = transfer.from_client_id === accessData.client_id;
          const otherClient = isOutgoing 
            ? transfer.to_clients?.nom && transfer.to_clients?.prenom 
              ? `${transfer.to_clients.prenom} ${transfer.to_clients.nom}` 
              : 'Client'
            : transfer.from_clients?.nom && transfer.from_clients?.prenom 
              ? `${transfer.from_clients.prenom} ${transfer.from_clients.nom}`
              : 'Client';
              
          return {
            id: transfer.id.toString(),
            type: 'transfer' as const,
            date: transfer.created_at,
            amount: transfer.amount,
            description: transfer.description || (isOutgoing ? `Transfert vers ${otherClient}` : `Transfert de ${otherClient}`),
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
