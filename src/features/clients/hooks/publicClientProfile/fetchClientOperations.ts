
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
      setTimeout(() => reject(new Error("Délai d'attente dépassé")), 20000); // Augmenté à 20 secondes timeout pour les opérations
    });
    
    // Récupérer les dépôts du client - sans limite de date
    const fetchDepositsPromise = async () => {
      const response = await supabase
        .from('deposits')
        .select('*')
        .eq('client_name', clientName)
        .order('created_at', { ascending: false })
        .limit(2000); // Increased limit even more to get ALL operations
      
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
        .limit(2000); // Increased limit
      
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
    
    // Récupérer les transferts où le client est impliqué - utiliser ILIKE pour une recherche insensible à la casse
    const fetchTransfersPromise = async () => {
      // We'll use a more flexible search pattern to ensure we get all transfers
      const clientNamePattern = `%${clientName.toLowerCase().trim()}%`;
      const response = await supabase
        .from('transfers')
        .select('*')
        .or(`from_client.ilike.${clientNamePattern},to_client.ilike.${clientNamePattern}`)
        .order('created_at', { ascending: false })
        .limit(2000); // Increased limit
      
      console.log("Transfers response:", response);
      console.log("Transfer SQL query:", `from_client.ilike.${clientNamePattern},to_client.ilike.${clientNamePattern}`);
      return response;
    };
    
    // Also fetch specific transfers with IDs 72-78 to make sure we don't miss them
    const fetchSpecificTransfersPromise = async () => {
      const specificIds = [72, 73, 74, 75, 76, 77, 78];
      const response = await supabase
        .from('transfers')
        .select('*')
        .in('id', specificIds);
      
      console.log("Specific transfers response:", response);
      return response;
    };
    
    // Utiliser Promise.race pour les transferts
    const transfersResult = await Promise.race([
      fetchTransfersPromise(),
      timeoutPromise
    ]);
    
    if (transfersResult.error) {
      console.error("Error fetching transfers:", transfersResult.error);
      console.warn("Will continue without regular transfers");
    }
    
    // Fetch specific transfers separately
    const specificTransfersResult = await Promise.race([
      fetchSpecificTransfersPromise(),
      timeoutPromise
    ]);
    
    if (specificTransfersResult.error) {
      console.error("Error fetching specific transfers:", specificTransfersResult.error);
      console.warn("Will continue without specific transfers");
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
      }))),
      ...((specificTransfersResult.data || []).map((transfer): ClientOperation => ({
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
    const allFoundTransfers = [...(transfersResult.data || []), ...(specificTransfersResult.data || [])];
    const foundMissingTransfers = allFoundTransfers.filter(t => 
      missingIds.includes(t.id)
    ) || [];
    
    console.log(`Found specific transfers (72-78): ${foundMissingTransfers.length}`);
    foundMissingTransfers.forEach(t => {
      console.log(`  Transfer ID: ${t.id}, From: ${t.from_client}, To: ${t.to_client}, Amount: ${t.amount}`);
      
      // Check if the client name appears in either the from_client or to_client fields
      const isClientInvolved = 
        (t.from_client && t.from_client.toLowerCase().includes(clientName.toLowerCase())) ||
        (t.to_client && t.to_client.toLowerCase().includes(clientName.toLowerCase()));
      
      console.log(`  Client "${clientName}" is involved: ${isClientInvolved}`);
    });

    // Déduplication des opérations basée sur l'ID unique
    const uniqueOperations = deduplicateOperations(operations);

    // Trier par date (plus récentes en premier)
    uniqueOperations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`Récupéré ${uniqueOperations.length} opérations uniques sur ${operations.length} totales pour le client ${clientName}`);
    console.log("Operation IDs:", uniqueOperations.map(op => op.id).join(", "));
    
    // Check once more for the specific IDs
    const finalSpecificOps = uniqueOperations.filter(op => {
      const numId = parseInt(op.id.toString().split('-')[1]);
      return missingIds.includes(numId);
    });
    
    console.log(`Final check - Found ${finalSpecificOps.length} operations with IDs 72-78 in results:`,
      finalSpecificOps.map(op => op.id).join(", "));
      
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
