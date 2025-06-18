
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
      setTimeout(() => reject(new Error("Délai d'attente dépassé")), 15000); // Augmenté à 15 secondes
    });
    
    // Récupérer les dépôts du client - FILTRER PAR CLIENT NAME
    const fetchDepositsPromise = async () => {
      console.log(`Recherche de dépôts pour: "${clientName}"`);
      const response = await supabase
        .from('deposits')
        .select('*')
        .eq('client_name', clientName)
        .order('created_at', { ascending: false });
      
      console.log(`Dépôts trouvés pour ${clientName}:`, response.data?.length || 0);
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

    // Récupérer les retraits du client - FILTRER PAR CLIENT NAME
    const fetchWithdrawalsPromise = async () => {
      console.log(`Recherche de retraits pour: "${clientName}"`);
      const response = await supabase
        .from('withdrawals')
        .select('*')
        .eq('client_name', clientName)
        .order('created_at', { ascending: false });
      
      console.log(`Retraits trouvés pour ${clientName}:`, response.data?.length || 0);
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

    // Récupérer les transferts du client - FILTRER PAR CLIENT NAME (à la fois comme expéditeur et destinataire)
    const fetchTransfersPromise = async () => {
      console.log(`Recherche de transferts pour: "${clientName}"`);
      const [fromTransfers, toTransfers] = await Promise.all([
        supabase
          .from('transfers')
          .select('*')
          .eq('from_client', clientName)
          .order('created_at', { ascending: false }),
        supabase
          .from('transfers')
          .select('*')
          .eq('to_client', clientName)
          .order('created_at', { ascending: false })
      ]);
      
      console.log(`Transferts FROM trouvés pour ${clientName}:`, fromTransfers.data?.length || 0);
      console.log(`Transferts TO trouvés pour ${clientName}:`, toTransfers.data?.length || 0);
      return { fromTransfers, toTransfers };
    };

    const transfersResult = await Promise.race([
      fetchTransfersPromise(),
      timeoutPromise
    ]);

    if (transfersResult.fromTransfers.error || transfersResult.toTransfers.error) {
      console.error("Error fetching transfers:", transfersResult.fromTransfers.error || transfersResult.toTransfers.error);
      throw new Error("Erreur lors de la récupération des transferts");
    }

    // Récupérer les opérations directes du client - FILTRER PAR CLIENT NAME
    const fetchDirectOperationsPromise = async () => {
      console.log(`Recherche d'opérations directes pour: "${clientName}"`);
      const [fromOperations, toOperations] = await Promise.all([
        supabase
          .from('direct_operations')
          .select('*')
          .eq('from_client_name', clientName)
          .order('created_at', { ascending: false }),
        supabase
          .from('direct_operations')
          .select('*')
          .eq('to_client_name', clientName)
          .order('created_at', { ascending: false })
      ]);
      
      console.log(`Opérations directes FROM trouvées pour ${clientName}:`, fromOperations.data?.length || 0);
      console.log(`Opérations directes TO trouvées pour ${clientName}:`, toOperations.data?.length || 0);
      console.log(`Sample FROM operation:`, fromOperations.data?.[0]);
      console.log(`Sample TO operation:`, toOperations.data?.[0]);
      return { fromOperations, toOperations };
    };

    const directOperationsResult = await Promise.race([
      fetchDirectOperationsPromise(),
      timeoutPromise
    ]);

    if (directOperationsResult.fromOperations.error || directOperationsResult.toOperations.error) {
      console.error("Error fetching direct operations:", directOperationsResult.fromOperations.error || directOperationsResult.toOperations.error);
      // Ne pas faire échouer la requête entière pour les opérations directes
    }

    // Log pour déboguer les résultats
    console.log("PublicClientOperations - Deposits found:", depositsResult.data?.length || 0);
    console.log("PublicClientOperations - Withdrawals found:", withdrawalsResult.data?.length || 0);
    console.log("PublicClientOperations - From transfers found:", transfersResult.fromTransfers.data?.length || 0);
    console.log("PublicClientOperations - To transfers found:", transfersResult.toTransfers.data?.length || 0);
    console.log("PublicClientOperations - From direct ops found:", directOperationsResult.fromOperations?.data?.length || 0);
    console.log("PublicClientOperations - To direct ops found:", directOperationsResult.toOperations?.data?.length || 0);

    // Combiner et formater les opérations
    const operations: ClientOperation[] = [
      // Dépôts
      ...(depositsResult.data || []).map((deposit): ClientOperation => ({
        id: `deposit-${deposit.id}`,
        type: "deposit",
        date: deposit.operation_date || deposit.created_at,
        amount: deposit.amount,
        description: deposit.notes || `Versement`,
        status: deposit.status,
        fromClient: deposit.client_name,
        operation_date: deposit.operation_date || deposit.created_at
      })),
      // Retraits
      ...(withdrawalsResult.data || []).map((withdrawal): ClientOperation => ({
        id: `withdrawal-${withdrawal.id}`,
        type: "withdrawal",
        date: withdrawal.operation_date || withdrawal.created_at,
        amount: withdrawal.amount,
        description: withdrawal.notes || `Retrait`,
        status: withdrawal.status,
        fromClient: withdrawal.client_name,
        operation_date: withdrawal.operation_date || withdrawal.created_at
      })),
      // Transferts depuis ce client
      ...(transfersResult.fromTransfers.data || []).map((transfer): ClientOperation => ({
        id: `transfer-${transfer.id}`,
        type: "transfer",
        date: transfer.operation_date || transfer.created_at,
        amount: transfer.amount,
        description: transfer.reason || `Transfert vers ${transfer.to_client}`,
        status: transfer.status,
        fromClient: transfer.from_client,
        toClient: transfer.to_client,
        operation_date: transfer.operation_date || transfer.created_at
      })),
      // Transferts vers ce client
      ...(transfersResult.toTransfers.data || []).map((transfer): ClientOperation => ({
        id: `transfer-in-${transfer.id}`,
        type: "transfer",
        date: transfer.operation_date || transfer.created_at,
        amount: transfer.amount,
        description: transfer.reason || `Transfert de ${transfer.from_client}`,
        status: transfer.status,
        fromClient: transfer.from_client,
        toClient: transfer.to_client,
        operation_date: transfer.operation_date || transfer.created_at
      })),
      // Opérations directes depuis ce client
      ...(directOperationsResult.fromOperations?.data || []).map((operation): ClientOperation => ({
        id: `direct-${operation.id}`,
        type: "direct_transfer",
        date: operation.operation_date || operation.created_at,
        amount: operation.amount,
        description: operation.notes || `Opération directe vers ${operation.to_client_name}`,
        status: operation.status,
        fromClient: operation.from_client_name,
        toClient: operation.to_client_name,
        operation_date: operation.operation_date || operation.created_at
      })),
      // Opérations directes vers ce client
      ...(directOperationsResult.toOperations?.data || []).map((operation): ClientOperation => ({
        id: `direct-in-${operation.id}`,
        type: "direct_transfer",
        date: operation.operation_date || operation.created_at,
        amount: operation.amount,
        description: operation.notes || `Opération directe de ${operation.from_client_name}`,
        status: operation.status,
        fromClient: operation.from_client_name,
        toClient: operation.to_client_name,
        operation_date: operation.operation_date || operation.created_at
      }))
    ];

    // Déduplication des opérations basée sur l'ID unique
    const uniqueOperations = deduplicateOperations(operations);

    // Trier par date (plus récentes en premier)
    uniqueOperations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`PublicClientOperations - Récupéré ${uniqueOperations.length} opérations uniques pour le client ${clientName}`);
    console.log("PublicClientOperations - Types d'opérations:", {
      deposits: uniqueOperations.filter(op => op.type === 'deposit').length,
      withdrawals: uniqueOperations.filter(op => op.type === 'withdrawal').length,
      transfers: uniqueOperations.filter(op => op.type === 'transfer').length,
      direct_transfers: uniqueOperations.filter(op => op.type === 'direct_transfer').length
    });
    
    // Log détaillé des opérations trouvées
    uniqueOperations.forEach(op => {
      console.log(`Operation: ${op.type} - ${op.amount} - ${op.description}`);
    });
    
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
