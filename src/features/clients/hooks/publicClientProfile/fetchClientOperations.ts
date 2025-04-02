
import { supabase } from "@/integrations/supabase/client";
import { ClientOperation } from "./types";

// Define explicit interfaces for each record type with all needed properties
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
  client_id: number;
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
      .maybeSingle();
      
    if (accessResult.error) {
      throw new Error(`Erreur d'authentification: ${accessResult.error.message}`);
    }
    
    if (!accessResult.data) {
      throw new Error("Token d'accès invalide ou expiré");
    }

    const clientId = accessResult.data.client_id;
    if (!clientId) {
      throw new Error("ID client manquant dans le token d'accès");
    }
    
    // Initialize empty arrays - use type assertions to simplify type inference
    const depositsData: DepositRecord[] = [];
    const withdrawalsData: WithdrawalRecord[] = [];
    const fromClientData: TransferRecord[] = [];
    const toClientData: TransferRecord[] = [];

    // Get deposits
    const depositsResult = await supabase
      .from('deposits')
      .select('id, amount, created_at, notes, status, client_id, client_name, operation_date')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (depositsResult.error) {
      console.error("Error in deposits query:", depositsResult.error);
    } else if (depositsResult.data) {
      // Add items one by one with explicit type casting
      for (let i = 0; i < depositsResult.data.length; i++) {
        depositsData.push(depositsResult.data[i] as DepositRecord);
      }
    }
    
    // Get withdrawals
    const withdrawalsResult = await supabase
      .from('withdrawals')
      .select('id, amount, created_at, notes, status, client_name, operation_date')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (withdrawalsResult.error) {
      console.error("Error in withdrawals query:", withdrawalsResult.error);
    } else if (withdrawalsResult.data) {
      // Add items one by one with explicit type casting
      for (let i = 0; i < withdrawalsResult.data.length; i++) {
        withdrawalsData.push(withdrawalsResult.data[i] as WithdrawalRecord);
      }
    }
    
    // Get outgoing transfers
    const fromClientResult = await supabase
      .from('transfers')
      .select('id, amount, created_at, reason, status, from_client, to_client, operation_date')
      .eq('from_client', clientName)
      .order('created_at', { ascending: false });
    
    if (fromClientResult.error) {
      console.error("Error in from-client transfers query:", fromClientResult.error);
    } else if (fromClientResult.data) {
      // Add items one by one with explicit type casting
      for (let i = 0; i < fromClientResult.data.length; i++) {
        fromClientData.push(fromClientResult.data[i] as TransferRecord);
      }
    }
    
    // Get incoming transfers
    const toClientResult = await supabase
      .from('transfers')
      .select('id, amount, created_at, reason, status, from_client, to_client, operation_date')
      .eq('to_client', clientName)
      .order('created_at', { ascending: false });
    
    if (toClientResult.error) {
      console.error("Error in to-client transfers query:", toClientResult.error);
    } else if (toClientResult.data) {
      // Add items one by one with explicit type casting
      for (let i = 0; i < toClientResult.data.length; i++) {
        toClientData.push(toClientResult.data[i] as TransferRecord);
      }
    }
    
    // Manually combine transfers to prevent complex type inference
    const transfers: TransferRecord[] = [];
    for (let i = 0; i < fromClientData.length; i++) {
      transfers.push(fromClientData[i]);
    }
    for (let i = 0; i < toClientData.length; i++) {
      transfers.push(toClientData[i]);
    }
    
    // Map operations to a unified format with simple iteration
    const combinedOperations: ClientOperation[] = [];
    
    // Map deposits to ClientOperation
    for (let i = 0; i < depositsData.length; i++) {
      const deposit = depositsData[i];
      combinedOperations.push({
        id: deposit.id.toString(),
        type: 'deposit',
        date: deposit.created_at,
        amount: deposit.amount,
        description: deposit.notes || 'Dépôt',
        status: deposit.status
      });
    }
    
    // Map withdrawals to ClientOperation
    for (let i = 0; i < withdrawalsData.length; i++) {
      const withdrawal = withdrawalsData[i];
      combinedOperations.push({
        id: withdrawal.id.toString(),
        type: 'withdrawal',
        date: withdrawal.created_at,
        amount: withdrawal.amount,
        description: withdrawal.notes || 'Retrait',
        status: withdrawal.status
      });
    }
    
    // Map transfers to ClientOperation
    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];
      const isOutgoing = transfer.from_client === clientName;
      const otherClient = isOutgoing ? transfer.to_client : transfer.from_client;
      
      combinedOperations.push({
        id: transfer.id.toString(),
        type: 'transfer',
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
