
import { supabase } from "@/integrations/supabase/client";
import { ClientOperation } from "./types";
import { validateTokenAccess } from "./operations/authCheck";
import { fetchDeposits, mapDepositsToOperations } from "./operations/fetchDeposits";
import { fetchWithdrawals, mapWithdrawalsToOperations } from "./operations/fetchWithdrawals";
import { 
  fetchOutgoingTransfers, 
  fetchIncomingTransfers, 
  mapTransfersToOperations 
} from "./operations/fetchTransfers";
import { sortOperationsByDate, createTimeoutController, handleFetchError } from "./operations/utils";

export const fetchClientOperations = async (clientName: string, token: string): Promise<ClientOperation[]> => {
  // Create abort controller for timeout handling
  const { controller, timeoutId } = createTimeoutController(15000);

  try {
    // For better error messages
    if (!navigator.onLine) {
      throw new Error("Vous êtes hors ligne. Vérifiez votre connexion internet.");
    }
    
    // First, retrieve client ID from the token for security check
    const accessCheck = await validateTokenAccess(token);
    
    if (!accessCheck.isValid || !accessCheck.clientId) {
      throw new Error(accessCheck.error || "Erreur d'accès non spécifiée");
    }
    
    const clientId = accessCheck.clientId;
    
    // Fetch all operation types in parallel for better performance
    const [depositsData, withdrawalsData, outgoingTransfers, incomingTransfers] = await Promise.all([
      fetchDeposits(clientId),
      fetchWithdrawals(clientId),
      fetchOutgoingTransfers(clientName),
      fetchIncomingTransfers(clientName)
    ]);
    
    // Combine transfers arrays
    const allTransfers = [...outgoingTransfers, ...incomingTransfers];
    
    // Convert each operation type to unified ClientOperation format
    const depositOperations = mapDepositsToOperations(depositsData);
    const withdrawalOperations = mapWithdrawalsToOperations(withdrawalsData);
    const transferOperations = mapTransfersToOperations(allTransfers, clientName);
    
    // Combine all operations
    const combinedOperations = [
      ...depositOperations,
      ...withdrawalOperations,
      ...transferOperations
    ];
    
    // Sort all operations by date and return
    return sortOperationsByDate(combinedOperations);
    
  } catch (error: any) {
    return handleFetchError(error);
  } finally {
    clearTimeout(timeoutId);
  }
};
