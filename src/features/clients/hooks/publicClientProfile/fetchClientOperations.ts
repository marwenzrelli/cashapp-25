
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
      setTimeout(() => reject(new Error("Délai d'attente dépassé")), 15000); // 15 secondes timeout pour les opérations
    });
    
    // Récupérer les dépôts du client - sans limite de date
    const fetchDepositsPromise = async () => {
      const response = await supabase
        .from('deposits')
        .select('*')
        .eq('client_name', clientName)
        .order('created_at', { ascending: false })
        .limit(1000); // Increased limit to get ALL operations
      
      console.log("Deposits response:", response);
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

    // Récupérer les retraits du client - sans limite de date
    const fetchWithdrawalsPromise = async () => {
      const response = await supabase
        .from('withdrawals')
        .select('*')
        .eq('client_name', clientName)
        .order('created_at', { ascending: false })
        .limit(1000); // Increased limit
      
      console.log("Withdrawals response:", response);
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
    
    // Récupérer les transferts où le client est impliqué
    const fetchTransfersPromise = async () => {
      const response = await supabase
        .from('transfers')
        .select('*')
        .or(`from_client.eq.${clientName},to_client.eq.${clientName}`)
        .order('created_at', { ascending: false })
        .limit(1000); // Increased limit
      
      console.log("Transfers response:", response);
      return response;
    };
    
    // Utiliser Promise.race pour les transferts
    const transfersResult = await Promise.race([
      fetchTransfersPromise(),
      timeoutPromise
    ]);
    
    if (transfersResult.error) {
      console.error("Error fetching transfers:", transfersResult.error);
      console.warn("Will continue without transfers");
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
      })),
      ...((transfersResult.data || []).map((transfer): ClientOperation => ({
        id: `transfer-${transfer.id}`,
        type: "transfer",
        date: transfer.operation_date || transfer.created_at,
        amount: transfer.amount,
        description: transfer.reason || `Virement`,
        status: transfer.status,
        fromClient: transfer.from_client,
        toClient: transfer.to_client
      })))
    ];
    
    // Check specifically for transfers with IDs 72-78 to ensure they're included
    const missingIds = [72, 73, 74, 75, 76, 77, 78];
    const foundMissingTransfers = transfersResult.data?.filter(t => 
      missingIds.includes(t.id)
    ) || [];
    
    console.log(`Found specific transfers (72-78): ${foundMissingTransfers.length}`);
    foundMissingTransfers.forEach(t => {
      console.log(`  Transfer ID: ${t.id}, From: ${t.from_client}, To: ${t.to_client}, Amount: ${t.amount}`);
    });

    // Déduplication des opérations basée sur l'ID unique
    const uniqueOperations = deduplicateOperations(operations);

    // Trier par date (plus récentes en premier)
    uniqueOperations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`Récupéré ${uniqueOperations.length} opérations uniques sur ${operations.length} totales pour le client ${clientName}`);
    console.log("Operation IDs:", uniqueOperations.map(op => op.id).join(", "));
    return uniqueOperations;
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

// Fonction utilitaire pour dédupliquer les opérations basées sur leur ID unique
function deduplicateOperations(operations: ClientOperation[]): ClientOperation[] {
  // Utiliser un Map pour stocker les opérations uniques par ID
  const uniqueOps = new Map<string, ClientOperation>();
  
  for (const operation of operations) {
    // Vérifier si cette opération existe déjà dans notre Map
    if (!uniqueOps.has(operation.id)) {
      uniqueOps.set(operation.id, operation);
    }
  }
  
  // Convertir le Map en tableau
  return Array.from(uniqueOps.values());
}
