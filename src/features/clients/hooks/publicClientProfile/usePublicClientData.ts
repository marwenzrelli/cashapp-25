
import { useState } from "react";
import { Client } from "@/features/clients/types";
import { Operation } from "@/features/operations/types";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/features/operations/types";

export const usePublicClientData = (token: string | undefined) => {
  const [client, setClient] = useState<Client | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientData = async () => {
    try {
      if (!token) return;

      console.log("Début de la récupération des données avec le token:", token);

      // Récupérer d'abord l'accès QR
      const { data: qrAccess, error: qrError } = await supabase
        .from('qr_access')
        .select('client_id, expires_at')
        .eq('access_token', token)
        .single();

      if (qrError) {
        console.error("Erreur QR Access:", qrError);
        throw new Error("Token d'accès invalide");
      }
      
      console.log("QR Access trouvé:", qrAccess);
      
      if (qrAccess.expires_at && new Date(qrAccess.expires_at) < new Date()) {
        throw new Error("Le lien a expiré");
      }

      // Récupérer les informations du client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', qrAccess.client_id)
        .single();

      if (clientError) {
        console.error("Erreur Client:", clientError);
        throw clientError;
      }

      console.log("Client trouvé:", clientData);
      setClient(clientData);

      await fetchOperations(clientData);
    } catch (err) {
      console.error("Erreur complète:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOperations = async (clientData: Client) => {
    // Récupérer toutes les opérations
    const clientFullName = `${clientData.prenom} ${clientData.nom}`;
    console.log("Recherche des opérations pour:", clientFullName);

    // Récupérer les versements
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .eq('client_name', clientFullName)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (depositsError) {
      console.error("Erreur lors de la récupération des versements:", depositsError);
    } else {
      console.log("Versements trouvés:", deposits);
    }

    // Récupérer les retraits
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('client_name', clientFullName)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (withdrawalsError) {
      console.error("Erreur lors de la récupération des retraits:", withdrawalsError);
    } else {
      console.log("Retraits trouvés:", withdrawals);
    }

    // Récupérer les virements
    const { data: transfers, error: transfersError } = await supabase
      .from('transfers')
      .select('*')
      .or(`from_client.eq."${clientFullName}",to_client.eq."${clientFullName}"`)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (transfersError) {
      console.error("Erreur lors de la récupération des virements:", transfersError);
    } else {
      console.log("Virements trouvés:", transfers);
    }

    // Transformer les données en format unifié - utiliser created_at comme date principale
    const allOperations: Operation[] = [
      ...(deposits || []).map((d): Operation => ({
        id: d.id.toString().slice(-6),
        type: "deposit",
        amount: d.amount,
        date: d.created_at, // Utiliser created_at au lieu de operation_date
        createdAt: d.created_at,
        description: `Versement de ${d.client_name}`,
        fromClient: d.client_name,
        formattedDate: formatDateTime(d.created_at)
      })),
      ...(withdrawals || []).map((w): Operation => ({
        id: w.id.toString().slice(-6),
        type: "withdrawal",
        amount: w.amount,
        date: w.created_at, // Utiliser created_at au lieu de operation_date
        createdAt: w.created_at,
        description: `Retrait par ${w.client_name}`,
        fromClient: w.client_name,
        formattedDate: formatDateTime(w.created_at)
      })),
      ...(transfers || []).map((t): Operation => ({
        id: t.id.toString().slice(-6),
        type: "transfer",
        amount: t.amount,
        date: t.created_at, // Utiliser created_at au lieu de operation_date
        createdAt: t.created_at,
        description: t.reason || "Virement",
        fromClient: t.from_client,
        toClient: t.to_client,
        formattedDate: formatDateTime(t.created_at)
      }))
    ].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

    console.log("Opérations transformées:", allOperations);
    setOperations(allOperations);
  };

  return {
    client,
    setClient,
    operations,
    setOperations,
    isLoading,
    error,
    fetchClientData
  };
};
