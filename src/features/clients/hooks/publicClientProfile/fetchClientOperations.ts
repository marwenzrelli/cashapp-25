
import { supabase } from "@/integrations/supabase/client";
import { ClientOperation } from "./types";

export const fetchClientOperations = async (
  clientName: string,
  token: string
): Promise<ClientOperation[]> => {
  try {
    console.log(`Fetching operations for client: ${clientName}`);
    
    // Set a shorter timeout for this specific query
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout
    
    // Récupérer les dépôts du client
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*', {
        signal: controller.signal // Pass the signal as an option to select()
      })
      .eq('client_name', clientName)
      .order('created_at', { ascending: false });

    if (depositsError) {
      console.error("Error fetching deposits:", depositsError);
      throw new Error(`Erreur lors de la récupération des dépôts: ${depositsError.message}`);
    }

    // Récupérer les retraits du client
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*', {
        signal: controller.signal // Pass the signal as an option to select()
      })
      .eq('client_name', clientName)
      .order('created_at', { ascending: false });

    // Clear timeout
    clearTimeout(timeoutId);

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

    console.log(`Retrieved ${operations.length} operations for client ${clientName}`);
    return operations;
  } catch (error: any) {
    console.error("Error in fetchClientOperations:", error);
    
    // More specific error handling
    if (error.name === 'AbortError') {
      throw new Error("Délai d'attente dépassé lors de la récupération des opérations");
    }
    
    throw new Error(error.message || "Erreur lors de la récupération des opérations");
  }
};
