
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
    
    // Récupérer les dépôts du client avec un délai d'attente plus long
    const depositsPromise = supabase
      .from('deposits')
      .select('*')
      .eq('client_name', clientName)
      .order('created_at', { ascending: false });

    // Récupérer les retraits du client
    const withdrawalsPromise = supabase
      .from('withdrawals')
      .select('*')
      .eq('client_name', clientName)
      .order('created_at', { ascending: false });
      
    // Run both queries in parallel for better performance
    const [depositsResult, withdrawalsResult] = await Promise.all([
      depositsPromise,
      withdrawalsPromise
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
  } catch (error: any) {
    console.error("Error in fetchClientOperations:", error);
    throw new Error(error.message || "Erreur lors de la récupération des opérations");
  }
};
