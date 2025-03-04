
import { useState, useEffect } from "react";
import { Client } from "@/features/clients/types";
import { Operation } from "@/features/operations/types";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/features/operations/types";
import { handleSupabaseError } from "../utils/errorUtils";

export const usePublicClientData = (token: string | undefined) => {
  const [client, setClient] = useState<Client | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      
      if (!token) {
        setError("Token d'accès manquant");
        return;
      }

      console.log("Début de la récupération des données avec le token:", token);

      // Récupérer d'abord l'accès QR avec une limite explicite et gestion d'erreur
      const { data: qrAccess, error: qrError } = await supabase
        .from('qr_access')
        .select('client_id, expires_at')
        .eq('access_token', token)
        .limit(1)
        .maybeSingle();

      if (qrError) {
        console.error("Erreur QR Access:", qrError);
        throw new Error("Token d'accès invalide");
      }
      
      if (!qrAccess) {
        throw new Error("Token d'accès non trouvé");
      }
      
      console.log("QR Access trouvé:", qrAccess);
      
      // Only check for expiration if the expires_at field is not null
      if (qrAccess.expires_at && new Date(qrAccess.expires_at) < new Date()) {
        throw new Error("Le lien a expiré");
      }

      // Récupérer les informations du client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', qrAccess.client_id)
        .maybeSingle();

      if (clientError) {
        console.error("Erreur Client:", clientError);
        throw clientError;
      }

      if (!clientData) {
        throw new Error("Client non trouvé");
      }

      console.log("Client trouvé:", clientData);
      setClient(clientData);

      // Allow operations fetch to fail without breaking the whole page
      try {
        await fetchOperations(clientData);
      } catch (opsError) {
        console.error("Erreur lors de la récupération des opérations:", opsError);
        // Don't rethrow, just log and set empty operations
        setOperations([]);
      }
    } catch (err) {
      console.error("Erreur complète:", err);
      setError(handleSupabaseError(err));
      setClient(null);
      setOperations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOperations = async (clientData: Client) => {
    if (!clientData) {
      console.error("Tentative de récupération d'opérations sans client valide");
      return;
    }
    
    // Récupérer toutes les opérations
    const clientFullName = `${clientData.prenom} ${clientData.nom}`;
    console.log("Recherche des opérations pour:", clientFullName);

    try {
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
        console.log("Versements trouvés:", deposits?.length || 0);
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
        console.log("Retraits trouvés:", withdrawals?.length || 0);
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
        console.log("Virements trouvés:", transfers?.length || 0);
      }

      // Transformer les données en format unifié
      const allOperations: Operation[] = [
        ...(deposits || []).map((d): Operation => ({
          id: d.id.toString().slice(-6),
          type: "deposit",
          amount: d.amount,
          date: d.created_at,
          createdAt: d.created_at,
          description: `Versement de ${d.client_name}`,
          fromClient: d.client_name,
          formattedDate: formatDateTime(d.created_at)
        })),
        ...(withdrawals || []).map((w): Operation => ({
          id: w.id.toString().slice(-6),
          type: "withdrawal",
          amount: w.amount,
          date: w.created_at,
          createdAt: w.created_at,
          description: `Retrait par ${w.client_name}`,
          fromClient: w.client_name,
          formattedDate: formatDateTime(w.created_at)
        })),
        ...(transfers || []).map((t): Operation => ({
          id: t.id.toString().slice(-6),
          type: "transfer",
          amount: t.amount,
          date: t.created_at,
          createdAt: t.created_at,
          description: t.reason || "Virement",
          fromClient: t.from_client,
          toClient: t.to_client,
          formattedDate: formatDateTime(t.created_at)
        }))
      ].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

      console.log("Opérations transformées:", allOperations.length);
      setOperations(allOperations);
    } catch (err) {
      console.error("Erreur lors de la transformation des opérations:", err);
      throw err;
    }
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
