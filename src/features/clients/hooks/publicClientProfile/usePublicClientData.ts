
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { showErrorToast } from "../utils/errorUtils";

interface ClientOperation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  date: string;
  amount: number;
  description: string;
  fromClient?: string;
  toClient?: string;
  formattedDate?: string;
}

interface PublicClientData {
  client: Client | null;
  operations: ClientOperation[];
  isLoading: boolean;
  error: string | null;
  fetchClientData: () => Promise<void>;
}

export const usePublicClientData = (token: string | undefined): PublicClientData => {
  const [client, setClient] = useState<Client | null>(null);
  const [operations, setOperations] = useState<ClientOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientData = useCallback(async () => {
    if (!token) {
      setError("Token d'accès manquant");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching client data with token:", token);
      setIsLoading(true);
      setError(null);

      // 1. Validate token format first (basic validation)
      if (!token.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        console.error("Invalid token format:", token);
        setError("Format de token invalide");
        setIsLoading(false);
        return;
      }

      // 2. Get client ID from token with additional validation
      const { data: accessData, error: accessError } = await supabase
        .from('qr_access')
        .select('client_id, expires_at, created_at')
        .eq('access_token', token)
        .single();

      if (accessError) {
        console.error("Error fetching access data:", accessError);
        setError("Token d'accès invalide ou expiré");
        setIsLoading(false);
        return;
      }

      if (!accessData) {
        console.error("No access data found for token:", token);
        setError("Token d'accès non reconnu");
        setIsLoading(false);
        return;
      }

      const { client_id, expires_at, created_at } = accessData;
      
      if (!client_id) {
        console.error("No client_id in access data for token:", token);
        setError("Token invalide: aucun client associé");
        setIsLoading(false);
        return;
      }

      // 3. Check if token is expired
      if (expires_at && new Date(expires_at) < new Date()) {
        console.error("Token expired at:", expires_at);
        setError("Ce lien d'accès a expiré");
        setIsLoading(false);
        return;
      }

      // 4. Get client data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', client_id)
        .single();

      if (clientError) {
        console.error("Error fetching client:", clientError);
        setError("Impossible de récupérer les données du client");
        setIsLoading(false);
        return;
      }

      if (!clientData) {
        console.error("No client data found for ID:", client_id);
        setError("Client introuvable");
        setIsLoading(false);
        return;
      }

      // 5. Validate client status - if client is inactive, deny access
      if (clientData.status === 'inactive' || clientData.status === 'suspended') {
        console.error("Client is inactive or suspended:", clientData.status);
        setError("Ce compte client est désactivé ou suspendu");
        setIsLoading(false);
        return;
      }

      setClient(clientData);

      // 6. Get client operations with proper client identification
      const clientFullName = `${clientData.prenom} ${clientData.nom}`;
      console.log("Getting operations for client:", clientFullName);

      try {
        // Fetch deposits
        const { data: deposits, error: depositsError } = await supabase
          .from('deposits')
          .select('*')
          .eq('client_name', clientFullName)
          .order('created_at', { ascending: false });

        if (depositsError) {
          console.error("Error fetching deposits:", depositsError);
        }

        // Fetch withdrawals
        const { data: withdrawals, error: withdrawalsError } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('client_name', clientFullName)
          .order('created_at', { ascending: false });

        if (withdrawalsError) {
          console.error("Error fetching withdrawals:", withdrawalsError);
        }

        // Fetch transfers (as sender)
        const { data: transfersAsSender, error: senderError } = await supabase
          .from('transfers')
          .select('*')
          .eq('from_client', clientFullName)
          .order('created_at', { ascending: false });

        if (senderError) {
          console.error("Error fetching transfers as sender:", senderError);
        }

        // Fetch transfers (as receiver)
        const { data: transfersAsReceiver, error: receiverError } = await supabase
          .from('transfers')
          .select('*')
          .eq('to_client', clientFullName)
          .order('created_at', { ascending: false });

        if (receiverError) {
          console.error("Error fetching transfers as receiver:", receiverError);
        }

        // Format and combine all operations
        const allOperations: ClientOperation[] = [
          ...(deposits || []).map(d => ({
            id: `deposit-${d.id}`,
            type: "deposit" as const,
            date: new Date(d.created_at).toLocaleDateString(),
            formattedDate: new Date(d.created_at).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            }),
            amount: Number(d.amount),
            description: d.notes || "Versement",
            fromClient: clientFullName
          })),
          ...(withdrawals || []).map(w => ({
            id: `withdrawal-${w.id}`,
            type: "withdrawal" as const,
            date: new Date(w.created_at).toLocaleDateString(),
            formattedDate: new Date(w.created_at).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            }),
            amount: Number(w.amount),
            description: w.notes || "Retrait",
            fromClient: clientFullName
          })),
          ...(transfersAsSender || []).map(t => ({
            id: `transfer-out-${t.id}`,
            type: "transfer" as const,
            date: new Date(t.created_at).toLocaleDateString(),
            formattedDate: new Date(t.created_at).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            }),
            amount: -Number(t.amount), // Negative amount for outgoing transfers
            description: t.reason || `Virement vers ${t.to_client}`,
            fromClient: t.from_client,
            toClient: t.to_client
          })),
          ...(transfersAsReceiver || []).map(t => ({
            id: `transfer-in-${t.id}`,
            type: "transfer" as const,
            date: new Date(t.created_at).toLocaleDateString(),
            formattedDate: new Date(t.created_at).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            }),
            amount: Number(t.amount), // Positive amount for incoming transfers
            description: t.reason || `Virement reçu de ${t.from_client}`,
            fromClient: t.from_client,
            toClient: t.to_client
          }))
        ].sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('-'));
          const dateB = new Date(b.date.split('/').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        });

        setOperations(allOperations);
        setIsLoading(false);
        setError(null);
      } catch (operationsError) {
        console.error("Error fetching operations:", operationsError);
        // Continue despite operations error, just show the client data
        setOperations([]);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error in fetchClientData:", err);
      setError("Une erreur est survenue lors de la récupération des données");
      setIsLoading(false);
    }
  }, [token]);

  return { client, operations, isLoading, error, fetchClientData };
};
