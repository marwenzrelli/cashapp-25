
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
    const depositsPromise = supabase
      .from('deposits')
      .select('*')
      .eq('client_name', clientName)
      .order('created_at', { ascending: false });
    
    // Utiliser Promise.race pour les dépôts
    const { data: deposits, error: depositsError } = await Promise.race([
      depositsPromise,
      timeoutPromise.then(() => {
        throw new Error("Délai d'attente dépassé lors de la récupération des dépôts");
      })
    ]) as typeof depositsPromise;

    if (depositsError) {
      console.error("Error fetching deposits:", depositsError);
      throw new Error(`Erreur lors de la récupération des dépôts: ${depositsError.message}`);
    }

    // Récupérer les retraits du client
    const withdrawalsPromise = supabase
      .from('withdrawals')
      .select('*')
      .eq('client_name', clientName)
      .order('created_at', { ascending: false });
    
    // Utiliser Promise.race pour les retraits
    const { data: withdrawals, error: withdrawalsError } = await Promise.race([
      withdrawalsPromise,
      timeoutPromise.then(() => {
        throw new Error("Délai d'attente dépassé lors de la récupération des retraits");
      })
    ]) as typeof withdrawalsPromise;

    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError);
      throw new Error(`Erreur lors de la récupération des retraits: ${withdrawalsError.message}`);
    }

    // Combiner et formater les opérations
    const operations: ClientOperation[] = [
      ...(deposits || []).map((deposit): ClientOperation => ({
        id: `deposit-${deposit.id}`,
        type: "deposit",
        date: deposit.operation_date || deposit.created_at,
        amount: deposit.amount,
        description: deposit.notes || `Versement`,
        status: deposit.status,
        fromClient: deposit.client_name
      })),
      ...(withdrawals || []).map((withdrawal): ClientOperation => ({
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
