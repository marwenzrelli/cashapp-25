
import { Operation } from "@/features/operations/types";
import { supabase } from "@/integrations/supabase/client";
import { ClientOperation } from "./types";

/**
 * Fetches all operations for a client based on their ID
 * @param clientId The client ID to fetch operations for
 * @param clientFullName The full name of the client (for display purposes)
 * @returns A promise that resolves to an array of operations
 */
export const fetchClientOperations = async (
  clientId: number,
  clientFullName: string
): Promise<ClientOperation[]> => {
  try {
    if (!clientId) {
      console.error("Client ID is required to fetch operations");
      return [];
    }

    console.log(`Fetching operations for client ID: ${clientId}, name: ${clientFullName}`);

    // Fetch deposits where this client is the depositor
    const { data: deposits, error: depositsError } = await supabase
      .from("deposits")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (depositsError) {
      console.error("Error fetching deposits:", depositsError);
      throw new Error(`Error fetching deposits: ${depositsError.message}`);
    }

    // Fetch withdrawals where this client is the withdrawer
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError);
      throw new Error(`Error fetching withdrawals: ${withdrawalsError.message}`);
    }

    // Fetch transfers where this client is the sender
    const { data: transfersAsSender, error: transfersAsSenderError } = await supabase
      .from("transfers")
      .select("*")
      .eq("from_client_id", clientId)
      .order("created_at", { ascending: false });

    if (transfersAsSenderError) {
      console.error("Error fetching transfers as sender:", transfersAsSenderError);
      throw new Error(`Error fetching transfers as sender: ${transfersAsSenderError.message}`);
    }

    // Fetch transfers where this client is the receiver
    const { data: transfersAsReceiver, error: transfersAsReceiverError } = await supabase
      .from("transfers")
      .select("*")
      .eq("to_client_id", clientId)
      .order("created_at", { ascending: false });

    if (transfersAsReceiverError) {
      console.error("Error fetching transfers as receiver:", transfersAsReceiverError);
      throw new Error(`Error fetching transfers as receiver: ${transfersAsReceiverError.message}`);
    }

    console.log("Operations fetched:", {
      deposits: deposits?.length || 0,
      withdrawals: withdrawals?.length || 0,
      transfersAsSender: transfersAsSender?.length || 0,
      transfersAsReceiver: transfersAsReceiver?.length || 0,
    });

    // Format and combine all operations
    const allOperations: ClientOperation[] = [
      ...(deposits || []).map(d => ({
        id: d.id.toString(),
        type: "deposit" as const,
        date: new Date(d.created_at).toLocaleDateString(),
        operation_date: d.operation_date || d.created_at,
        description: d.notes || `Versement de ${clientFullName}`,
        amount: d.amount,
        fromClient: clientFullName
      })),
      ...(withdrawals || []).map(w => ({
        id: w.id.toString(),
        type: "withdrawal" as const,
        date: new Date(w.created_at).toLocaleDateString(),
        operation_date: w.operation_date || w.created_at,
        description: w.notes || `Retrait par ${clientFullName}`,
        amount: w.amount,
        fromClient: clientFullName
      })),
      ...(transfersAsSender || []).map(t => ({
        id: t.id.toString(),
        type: "transfer" as const,
        date: new Date(t.created_at).toLocaleDateString(),
        operation_date: t.operation_date || t.created_at,
        description: t.reason || `Virement vers ${t.to_client}`,
        amount: -t.amount, // Negative amount for outgoing transfers
        fromClient: clientFullName,
        toClient: t.to_client
      })),
      ...(transfersAsReceiver || []).map(t => ({
        id: t.id.toString(),
        type: "transfer" as const,
        date: new Date(t.created_at).toLocaleDateString(),
        operation_date: t.operation_date || t.created_at,
        description: t.reason || `Virement de ${t.from_client}`,
        amount: t.amount, // Positive amount for incoming transfers
        fromClient: t.from_client,
        toClient: clientFullName
      }))
    ].sort((a, b) => {
      const dateA = new Date(a.operation_date).getTime();
      const dateB = new Date(b.operation_date).getTime();
      return dateB - dateA; // Sort by date, newest first
    });

    console.log(`Total combined operations: ${allOperations.length}`);
    return allOperations;
  } catch (error) {
    console.error("Error in fetchClientOperations:", error);
    throw error;
  }
};
