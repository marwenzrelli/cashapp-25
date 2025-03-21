
import { supabase } from "@/integrations/supabase/client";
import { ClientOperation } from "./types";
import { showErrorToast } from "../utils/errorUtils";

export const fetchClientOperations = async (clientFullName: string, token?: string): Promise<ClientOperation[]> => {
  try {
    console.log("Fetching operations for client:", clientFullName, "with token:", token ? `${token.substring(0, 8)}...` : "none");
    
    // Validate client name
    if (!clientFullName || clientFullName.trim() === '') {
      console.error("Invalid client full name:", clientFullName);
      return [];
    }
    
    // If we have a token, set it in the Supabase client auth header
    let authHeader = {};
    if (token) {
      authHeader = {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      };
    }

    // Fetch deposits
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .ilike('client_name', `%${clientFullName}%`)
      .order('operation_date', { ascending: false });

    if (depositsError) {
      console.error("Error fetching deposits:", depositsError);
      showErrorToast("Erreur de données", { message: "Erreur lors de la récupération des dépôts" });
    }
    
    console.log(`Found ${deposits?.length || 0} deposits for client:`, clientFullName);

    // Fetch withdrawals
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .ilike('client_name', `%${clientFullName}%`)
      .order('operation_date', { ascending: false });

    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError);
      showErrorToast("Erreur de données", { message: "Erreur lors de la récupération des retraits" });
    }
    
    console.log(`Found ${withdrawals?.length || 0} withdrawals for client:`, clientFullName);

    // Fetch transfers (as sender)
    const { data: transfersAsSender, error: senderError } = await supabase
      .from('transfers')
      .select('*')
      .ilike('from_client', `%${clientFullName}%`)
      .order('operation_date', { ascending: false });

    if (senderError) {
      console.error("Error fetching transfers as sender:", senderError);
      showErrorToast("Erreur de données", { message: "Erreur lors de la récupération des virements envoyés" });
    }
    
    console.log(`Found ${transfersAsSender?.length || 0} transfers as sender for client:`, clientFullName);

    // Fetch transfers (as receiver)
    const { data: transfersAsReceiver, error: receiverError } = await supabase
      .from('transfers')
      .select('*')
      .ilike('to_client', `%${clientFullName}%`)
      .order('operation_date', { ascending: false });

    if (receiverError) {
      console.error("Error fetching transfers as receiver:", receiverError);
      showErrorToast("Erreur de données", { message: "Erreur lors de la récupération des virements reçus" });
    }
    
    console.log(`Found ${transfersAsReceiver?.length || 0} transfers as receiver for client:`, clientFullName);

    // Format and combine all operations
    const allOperations: ClientOperation[] = [
      ...(deposits || []).map(d => ({
        id: `#deposi`,
        type: "deposit" as const,
        date: new Date(d.created_at).toLocaleDateString(),
        operation_date: d.operation_date || d.created_at,
        amount: Number(d.amount),
        description: d.notes || "Versement",
        fromClient: clientFullName
      })),
      ...(withdrawals || []).map(w => ({
        id: `#withdr`,
        type: "withdrawal" as const,
        date: new Date(w.created_at).toLocaleDateString(),
        operation_date: w.operation_date || w.created_at,
        amount: Number(w.amount),
        description: w.notes || "Retrait",
        fromClient: clientFullName
      })),
      ...(transfersAsSender || []).map(t => ({
        id: `#transf`,
        type: "transfer" as const,
        date: new Date(t.created_at).toLocaleDateString(),
        operation_date: t.operation_date || t.created_at,
        amount: -Number(t.amount), // Negative amount for outgoing transfers
        description: t.reason || `Virement vers ${t.to_client}`,
        fromClient: t.from_client,
        toClient: t.to_client
      })),
      ...(transfersAsReceiver || []).map(t => ({
        id: `#transf`,
        type: "transfer" as const,
        date: new Date(t.created_at).toLocaleDateString(),
        operation_date: t.operation_date || t.created_at,
        amount: Number(t.amount), // Positive amount for incoming transfers
        description: t.reason || `Virement reçu de ${t.from_client}`,
        fromClient: t.from_client,
        toClient: t.to_client
      }))
    ].sort((a, b) => {
      // Sort by operation_date if available
      const dateA = new Date(a.operation_date || a.date).getTime();
      const dateB = new Date(b.operation_date || b.date).getTime();
      return dateB - dateA; // Sort by most recent first
    });

    console.log(`Retrieved ${allOperations.length} operations for client ${clientFullName}`);
    return allOperations;
  } catch (error) {
    console.error("Error in fetchClientOperations:", error);
    return [];
  }
};
