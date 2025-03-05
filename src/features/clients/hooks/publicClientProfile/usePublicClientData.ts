
import { useState, useEffect, useCallback } from "react";
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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Listen for network changes
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchClientData = useCallback(async () => {
    try {
      if (isOffline) {
        setError("Vous êtes hors ligne. Veuillez vérifier votre connexion internet.");
        setIsLoading(false);
        return;
      }
      
      if (!token) {
        setError("Token d'accès manquant");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log("Début de la récupération des données avec le token:", token);

      // Récupérer d'abord l'accès QR avec un timeout
      const qrAccessPromise = supabase
        .from('qr_access')
        .select('client_id, expires_at')
        .eq('access_token', token)
        .maybeSingle();
        
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("La requête a expiré")), 10000);
      });
      
      const { data: qrAccess, error: qrError } = await Promise.race([
        qrAccessPromise,
        timeoutPromise
      ]) as any;

      if (qrError) {
        console.error("Erreur QR Access:", qrError);
        if (qrError.message?.includes("Failed to fetch") || 
            qrError.message?.includes("NetworkError") ||
            qrError.message?.includes("expiré")) {
          throw new Error("Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
        } else {
          throw new Error("Token d'accès invalide");
        }
      }
      
      if (!qrAccess) {
        throw new Error("Token d'accès non trouvé");
      }
      
      console.log("QR Access trouvé:", qrAccess);
      
      if (qrAccess.expires_at && new Date(qrAccess.expires_at) < new Date()) {
        throw new Error("Le lien a expiré");
      }

      // Récupérer les informations du client avec un timeout
      const clientPromise = supabase
        .from('clients')
        .select('*')
        .eq('id', qrAccess.client_id)
        .maybeSingle();
        
      const { data: clientData, error: clientError } = await Promise.race([
        clientPromise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("La requête client a expiré")), 10000);
        })
      ]) as any;

      if (clientError) {
        console.error("Erreur Client:", clientError);
        if (clientError.message?.includes("Failed to fetch") || 
            clientError.message?.includes("NetworkError") ||
            clientError.message?.includes("expiré")) {
          throw new Error("Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
        } else {
          throw clientError;
        }
      }

      if (!clientData) {
        throw new Error("Client non trouvé");
      }

      console.log("Client trouvé:", clientData);
      setClient(clientData);

      await fetchOperations(clientData);
    } catch (err) {
      console.error("Erreur complète:", err);
      setError(handleSupabaseError(err));
    } finally {
      setIsLoading(false);
    }
  }, [token, isOffline]);

  const fetchOperations = async (clientData: Client) => {
    if (isOffline) {
      console.log("Impossible de récupérer les opérations en mode hors ligne");
      return;
    }
    
    try {
      // Récupérer toutes les opérations
      const clientFullName = `${clientData.prenom} ${clientData.nom}`;
      console.log("Recherche des opérations pour:", clientFullName);

      // Timeout promise for all requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("La requête a expiré")), 10000);
      });

      // Récupérer les versements avec timeout
      const depositsPromise = supabase
        .from('deposits')
        .select('*')
        .eq('client_name', clientFullName)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
        
      const { data: deposits, error: depositsError } = await Promise.race([
        depositsPromise,
        timeoutPromise
      ]) as any;

      if (depositsError) {
        console.error("Erreur lors de la récupération des versements:", depositsError);
        if (depositsError.message?.includes("Failed to fetch") || 
            depositsError.message?.includes("NetworkError") ||
            depositsError.message?.includes("expiré")) {
          throw new Error("Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
        }
      } else {
        console.log("Versements trouvés:", deposits);
      }

      // Récupérer les retraits avec timeout
      const withdrawalsPromise = supabase
        .from('withdrawals')
        .select('*')
        .eq('client_name', clientFullName)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
        
      const { data: withdrawals, error: withdrawalsError } = await Promise.race([
        withdrawalsPromise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("La requête de retraits a expiré")), 10000);
        })
      ]) as any;

      if (withdrawalsError) {
        console.error("Erreur lors de la récupération des retraits:", withdrawalsError);
        if (withdrawalsError.message?.includes("Failed to fetch") || 
            withdrawalsError.message?.includes("NetworkError") ||
            withdrawalsError.message?.includes("expiré")) {
          throw new Error("Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
        }
      } else {
        console.log("Retraits trouvés:", withdrawals);
      }

      // Récupérer les virements avec timeout
      const transfersPromise = supabase
        .from('transfers')
        .select('*')
        .or(`from_client.eq."${clientFullName}",to_client.eq."${clientFullName}"`)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
        
      const { data: transfers, error: transfersError } = await Promise.race([
        transfersPromise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("La requête de virements a expiré")), 10000);
        })
      ]) as any;

      if (transfersError) {
        console.error("Erreur lors de la récupération des virements:", transfersError);
        if (transfersError.message?.includes("Failed to fetch") || 
            transfersError.message?.includes("NetworkError") ||
            transfersError.message?.includes("expiré")) {
          throw new Error("Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
        }
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
    } catch (error) {
      console.error("Erreur lors de la récupération des opérations:", error);
      // Ne pas définir l'erreur globale, juste laisser les opérations vides
    }
  };

  // Listen for network status changes and refetch when coming back online
  useEffect(() => {
    if (!isOffline && token && (error?.includes("connexion") || error?.includes("hors ligne"))) {
      fetchClientData();
    }
  }, [isOffline, token, error, fetchClientData]);

  useEffect(() => {
    fetchClientData();
  }, [token, fetchClientData]);

  return {
    client,
    setClient,
    operations,
    setOperations,
    isLoading,
    error,
    isOffline,
    fetchClientData
  };
};
