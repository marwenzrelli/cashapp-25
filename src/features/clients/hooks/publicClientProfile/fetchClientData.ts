
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { toast } from "sonner";
import { ClientOperation, TokenData } from "./types";
import { validateTokenExpiration, validateClientStatus } from "./validation";
import { showErrorToast } from "../utils/errorUtils";

export const fetchAccessData = async (token: string): Promise<TokenData> => {
  try {
    console.log("Fetching access data for token:", token);
    const { data, error } = await supabase
      .from('qr_access')
      .select('client_id, expires_at, created_at')
      .eq('access_token', token)
      .maybeSingle();  // Using maybeSingle instead of single to handle not found case better

    if (error) {
      console.error("Error fetching access data:", error);
      throw new Error("Token d'accès invalide ou expiré");
    }

    if (!data) {
      console.error("No access data found for token:", token);
      throw new Error("Token d'accès non reconnu dans notre système");
    }

    // Validate token expiration
    const expirationValidation = validateTokenExpiration(data.expires_at, data.created_at);
    if (!expirationValidation.isValid) {
      console.error("Token validation failed (expiration):", expirationValidation.error);
      throw new Error(expirationValidation.error || "Token expiré");
    }

    return data as TokenData;
  } catch (error) {
    console.error("Error in fetchAccessData:", error);
    throw error;
  }
};

export const fetchClientDetails = async (clientId: number): Promise<Client> => {
  try {
    console.log("Fetching client details for ID:", clientId);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();  // Using maybeSingle instead of single

    if (error) {
      console.error("Error fetching client:", error);
      throw new Error("Impossible de récupérer les données du client");
    }

    if (!data) {
      console.error("No client found with ID:", clientId);
      throw new Error("Client introuvable dans notre système");
    }

    // Validate client status
    const statusValidation = validateClientStatus(data.status);
    if (!statusValidation.isValid) {
      console.error("Client status validation failed:", statusValidation.error);
      throw new Error(statusValidation.error || "Statut client invalide");
    }

    return data as Client;
  } catch (error) {
    console.error("Error in fetchClientDetails:", error);
    throw error;
  }
};

export const fetchClientOperations = async (clientFullName: string): Promise<ClientOperation[]> => {
  try {
    // Fetch deposits
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .eq('client_name', clientFullName)
      .order('created_at', { ascending: false });

    if (depositsError) {
      console.error("Error fetching deposits:", depositsError);
      showErrorToast("Erreur de données", { message: "Erreur lors de la récupération des dépôts" });
    }

    // Fetch withdrawals
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('client_name', clientFullName)
      .order('created_at', { ascending: false });

    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError);
      showErrorToast("Erreur de données", { message: "Erreur lors de la récupération des retraits" });
    }

    // Fetch transfers (as sender)
    const { data: transfersAsSender, error: senderError } = await supabase
      .from('transfers')
      .select('*')
      .eq('from_client', clientFullName)
      .order('created_at', { ascending: false });

    if (senderError) {
      console.error("Error fetching transfers as sender:", senderError);
      showErrorToast("Erreur de données", { message: "Erreur lors de la récupération des virements envoyés" });
    }

    // Fetch transfers (as receiver)
    const { data: transfersAsReceiver, error: receiverError } = await supabase
      .from('transfers')
      .select('*')
      .eq('to_client', clientFullName)
      .order('created_at', { ascending: false });

    if (receiverError) {
      console.error("Error fetching transfers as receiver:", receiverError);
      showErrorToast("Erreur de données", { message: "Erreur lors de la récupération des virements reçus" });
    }

    // Format and combine all operations
    const allOperations: ClientOperation[] = [
      ...(deposits || []).map(d => ({
        id: `deposit-${d.id}`,
        type: "deposit" as const,
        date: new Date(d.created_at).toLocaleDateString(),
        amount: Number(d.amount),
        description: d.notes || "Versement",
        fromClient: clientFullName
      })),
      ...(withdrawals || []).map(w => ({
        id: `withdrawal-${w.id}`,
        type: "withdrawal" as const,
        date: new Date(w.created_at).toLocaleDateString(),
        amount: Number(w.amount),
        description: w.notes || "Retrait",
        fromClient: clientFullName
      })),
      ...(transfersAsSender || []).map(t => ({
        id: `transfer-out-${t.id}`,
        type: "transfer" as const,
        date: new Date(t.created_at).toLocaleDateString(),
        amount: -Number(t.amount), // Negative amount for outgoing transfers
        description: t.reason || `Virement vers ${t.to_client}`,
        fromClient: t.from_client,
        toClient: t.to_client
      })),
      ...(transfersAsReceiver || []).map(t => ({
        id: `transfer-in-${t.id}`,
        type: "transfer" as const,
        date: new Date(t.created_at).toLocaleDateString(),
        amount: Number(t.amount), // Positive amount for incoming transfers
        description: t.reason || `Virement reçu de ${t.from_client}`,
        fromClient: t.from_client,
        toClient: t.to_client
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return allOperations;
  } catch (error) {
    console.error("Error in fetchClientOperations:", error);
    return [];
  }
};
