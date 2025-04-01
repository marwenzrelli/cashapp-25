
import { supabase } from "@/integrations/supabase/client";
import { ClientOperation } from "./types";

export const fetchClientOperations = async (
  clientName: string,
  token: string
): Promise<ClientOperation[]> => {
  try {
    console.log(`Fetching operations for client: ${clientName}`);
    
    // Check our network connectivity
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new Error("Vous êtes hors ligne. Veuillez vérifier votre connexion internet.");
    }
    
    // Configuration des timeouts et réessais
    const maxRetries = 3; // Increased from 2 to 3
    const baseTimeout = 10000; // Increased from 8000 to 10000 milliseconds
    let currentRetry = 0;
    
    // Fonction pour tenter une requête avec réessais
    const attemptRequest = async (requestFn: () => Promise<any>, retryCount: number): Promise<any> => {
      try {
        // Créer un contrôleur d'abandon pour définir un délai d'expiration
        const controller = new AbortController();
        const { signal } = controller;
        
        // Augmenter le timeout exponentiellement avec chaque tentative
        const timeout = baseTimeout * Math.pow(2, retryCount); // Use power of 2 for more aggressive backoff
        
        // Définir un délai d'expiration pour cette tentative
        const timeoutId = setTimeout(() => {
          controller.abort(`Timeout of ${timeout}ms exceeded`);
        }, timeout);
        
        console.log(`Attempt ${retryCount + 1} with timeout: ${timeout}ms`);
        
        // Exécuter la requête avec le signal d'abandon
        const result = await requestFn();
        
        // Annuler le délai d'expiration s'il est toujours actif
        clearTimeout(timeoutId);
        
        return result;
      } catch (error: any) {
        // Si nous avons atteint le nombre maximal de tentatives, relancer l'erreur
        if (retryCount >= maxRetries) {
          console.error(`Max retries (${maxRetries}) reached for request. Last error:`, error);
          throw error;
        }
        
        // Pour les erreurs réseau ou les délais d'expiration, réessayer
        if (error.message?.includes("network") || 
            error.message?.includes("timeout") || 
            error.message?.includes("abort") || 
            error.name === "AbortError" || 
            error.message?.includes("interrompue") ||
            error.message?.includes("Failed to fetch")) {
          console.log(`Attempt ${retryCount + 1} failed, retrying in ${800 * (retryCount + 1)}ms...`);
          
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, 800 * (retryCount + 1)));
          
          // Réessayer la requête avec un compteur incrémenté
          return attemptRequest(requestFn, retryCount + 1);
        }
        
        // Pour les autres types d'erreurs, les relancer immédiatement
        throw error;
      }
    };
    
    // Fonction pour récupérer les dépôts avec réessai
    const fetchDeposits = async () => {
      const response = await supabase
        .from('deposits')
        .select('*')
        .eq('client_name', clientName)
        .order('created_at', { ascending: false });
      return response;
    };
    
    // Fonction pour récupérer les retraits avec réessai
    const fetchWithdrawals = async () => {
      const response = await supabase
        .from('withdrawals')
        .select('*')
        .eq('client_name', clientName)
        .order('created_at', { ascending: false });
      return response;
    };
    
    try {
      console.log("Starting parallel requests with retry mechanism");
      // Effectuer les deux requêtes en parallèle avec réessai automatique
      const [depositsResult, withdrawalsResult] = await Promise.all([
        attemptRequest(fetchDeposits, currentRetry),
        attemptRequest(fetchWithdrawals, currentRetry)
      ]);
      
      const { data: deposits, error: depositsError } = depositsResult;
      const { data: withdrawals, error: withdrawalsError } = withdrawalsResult;

      if (depositsError) {
        console.error("Error fetching deposits:", depositsError);
        throw new Error(`Erreur lors de la récupération des dépôts: ${depositsError.message}`);
      }

      if (withdrawalsError) {
        console.error("Error fetching withdrawals:", withdrawalsError);
        throw new Error(`Erreur lors de la récupération des retraits: ${withdrawalsError.message}`);
      }

      // Check for null data
      if (!deposits || !withdrawals) {
        throw new Error("Données des opérations non disponibles");
      }

      // Combiner et formater les opérations
      const operations: ClientOperation[] = [
        ...deposits.map((deposit): ClientOperation => ({
          id: `deposit-${deposit.id}`,
          type: "deposit",
          date: deposit.operation_date || deposit.created_at,
          amount: deposit.amount,
          description: deposit.notes || `Versement`,
          status: deposit.status,
          fromClient: deposit.client_name
        })),
        ...withdrawals.map((withdrawal): ClientOperation => ({
          id: `withdrawal-${withdrawal.id}`,
          type: "withdrawal",
          date: withdrawal.operation_date || withdrawal.created_at,
          amount: withdrawal.amount,
          description: withdrawal.notes || `Retrait`,
          status: withdrawal.status,
          fromClient: withdrawal.client_name
        }))
      ];

      // Trier par date (plus récentes en premier)
      operations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log(`Retrieved ${operations.length} operations for client ${clientName}`);
      return operations;
    } catch (error) {
      console.error("Error during Promise.all for operations:", error);
      throw error; // Re-throw to be caught by the outer try-catch
    }
  } catch (error: any) {
    console.error("Error in fetchClientOperations:", error);
    
    // Améliorer les messages d'erreur réseau
    if (error.message?.includes("network") || 
        error.message?.includes("Failed to fetch") || 
        error.message?.includes("timeout") || 
        error.name === "AbortError") {
      throw new Error("Le serveur semble temporairement inaccessible. Veuillez réessayer dans quelques instants.");
    }
    
    if (error.message?.includes("interrompue")) {
      throw new Error("La connexion au serveur a été interrompue. Veuillez réessayer.");
    }
    
    // Erreur par défaut
    throw new Error(error.message || "Erreur lors de la récupération des opérations");
  }
};
