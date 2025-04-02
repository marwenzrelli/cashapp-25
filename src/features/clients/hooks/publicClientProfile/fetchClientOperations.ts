
import { supabase } from "@/integrations/supabase/client";
import { ClientOperation } from "./types";

export const fetchClientOperations = async (
  clientName: string,
  token: string
): Promise<ClientOperation[]> => {
  try {
    console.log(`Récupération des opérations pour le client: ${clientName}`);
    
    // Utiliser une promesse avec timeout au lieu de AbortController
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Délai d'attente dépassé")), 10000); // 10 secondes timeout pour les opérations
    });
    
    // Récupérer les dépôts du client
    const fetchDepositsPromise = async () => {
      const response = await supabase
        .from('deposits')
        .select('*')
        .eq('client_name', clientName)
        .order('created_at', { ascending: false });
      
      return response;
    };
    
    // Utiliser Promise.race pour les dépôts
    const depositsResult = await Promise.race([
      fetchDepositsPromise(),
      timeoutPromise
    ]);

    if (depositsResult.error) {
      console.error("Error fetching deposits:", depositsResult.error);
      throw new Error(`Erreur lors de la récupération des dépôts: ${depositsResult.error.message}`);
    }

    // Récupérer les retraits du client
    const fetchWithdrawalsPromise = async () => {
      const response = await supabase
        .from('withdrawals')
        .select('*')
        .eq('client_name', clientName)
        .order('created_at', { ascending: false });
      
      return response;
    };
    
    // Utiliser Promise.race pour les retraits
    const withdrawalsResult = await Promise.race([
      fetchWithdrawalsPromise(),
      timeoutPromise
    ]);

    if (withdrawalsResult.error) {
      console.error("Error fetching withdrawals:", withdrawalsResult.error);
      throw new Error(`Erreur lors de la récupération des retraits: ${withdrawalsResult.error.message}`);
    }

    // Combiner et formater les opérations
    const operations: ClientOperation[] = [
      ...(depositsResult.data || []).map((deposit): ClientOperation => ({
        id: `deposit-${deposit.id}`,
        type: "deposit",
        date: deposit.operation_date || deposit.created_at,
        amount: deposit.amount,
        description: deposit.notes || `Versement`,
        status: deposit.status,
        fromClient: deposit.client_name
      })),
      ...(withdrawalsResult.data || []).map((withdrawal): ClientOperation => ({
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

    console.log(`Récupéré ${operations.length} opérations pour le client ${clientName}`);
    return operations;
  } catch (error: any) {
    console.error("Error in fetchClientOperations:", error);
    
    // Plus d'informations de diagnostic
    if (error.name === 'AbortError' || error.message.includes('délai') || error.message.includes('Délai')) {
      console.error("Timeout détecté pendant la récupération des opérations");
      throw new Error("Délai d'attente dépassé lors de la récupération des opérations");
    }
    
    throw new Error(error.message || "Erreur lors de la récupération des opérations");
  }
};
