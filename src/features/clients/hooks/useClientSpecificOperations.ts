
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Operation } from "@/features/operations/types";

export const useClientSpecificOperations = (clientId: number, clientName: string) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientOperations = useCallback(async () => {
    if (!clientId || !clientName) {
      console.log("ClientSpecificOperations - Missing clientId or clientName");
      setOperations([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log(`ClientSpecificOperations - Fetching operations for client: ${clientName} (ID: ${clientId})`);
      setIsLoading(true);
      setError(null);

      // Fetch all operation types in parallel, filtering by client
      const [depositsResult, withdrawalsResult, transfersResult, directOperationsResult] = await Promise.all([
        // Deposits for this client
        supabase
          .from('deposits')
          .select('*')
          .eq('client_name', clientName)
          .order('created_at', { ascending: false }),
        
        // Withdrawals for this client
        supabase
          .from('withdrawals')
          .select('*')
          .eq('client_name', clientName)
          .order('created_at', { ascending: false }),
        
        // Transfers where this client is sender OR receiver
        Promise.all([
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
        ]),
        
        // Direct operations where this client is sender OR receiver
        Promise.all([
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
        ])
      ]);

      // Check for errors
      if (depositsResult.error) {
        console.error("Error fetching deposits:", depositsResult.error);
        throw new Error(`Erreur dépôts: ${depositsResult.error.message}`);
      }
      if (withdrawalsResult.error) {
        console.error("Error fetching withdrawals:", withdrawalsResult.error);
        throw new Error(`Erreur retraits: ${withdrawalsResult.error.message}`);
      }

      // Handle transfers results (array of two results)
      const [fromTransfersResult, toTransfersResult] = transfersResult;
      if (fromTransfersResult.error || toTransfersResult.error) {
        console.error("Error fetching transfers:", fromTransfersResult.error || toTransfersResult.error);
        throw new Error("Erreur virements");
      }

      // Handle direct operations results (array of two results)
      const [fromDirectOpsResult, toDirectOpsResult] = directOperationsResult;
      if (fromDirectOpsResult.error || toDirectOpsResult.error) {
        console.error("Error fetching direct operations:", fromDirectOpsResult.error || toDirectOpsResult.error);
        throw new Error("Erreur opérations directes");
      }

      console.log(`ClientSpecificOperations - Found: ${depositsResult.data?.length || 0} deposits, ${withdrawalsResult.data?.length || 0} withdrawals`);
      console.log(`ClientSpecificOperations - Found: ${fromTransfersResult.data?.length || 0} outgoing transfers, ${toTransfersResult.data?.length || 0} incoming transfers`);
      console.log(`ClientSpecificOperations - Found: ${fromDirectOpsResult.data?.length || 0} outgoing direct ops, ${toDirectOpsResult.data?.length || 0} incoming direct ops`);

      // Transform to unified Operation format
      const allOperations: Operation[] = [
        // Deposits
        ...(depositsResult.data || []).map((deposit): Operation => ({
          id: `deposit-${deposit.id}`,
          type: "deposit",
          date: deposit.operation_date || deposit.created_at,
          operation_date: deposit.operation_date || deposit.created_at,
          amount: deposit.amount,
          description: deposit.notes || "Versement",
          status: deposit.status || "completed",
          client_id: deposit.client_id || clientId,
          createdAt: deposit.created_at
        })),
        
        // Withdrawals
        ...(withdrawalsResult.data || []).map((withdrawal): Operation => ({
          id: `withdrawal-${withdrawal.id}`,
          type: "withdrawal",
          date: withdrawal.operation_date || withdrawal.created_at,
          operation_date: withdrawal.operation_date || withdrawal.created_at,
          amount: withdrawal.amount,
          description: withdrawal.notes || "Retrait",
          status: withdrawal.status || "completed",
          client_id: withdrawal.client_id || clientId,
          createdAt: withdrawal.created_at
        })),
        
        // Outgoing transfers
        ...(fromTransfersResult.data || []).map((transfer): Operation => ({
          id: `transfer-${transfer.id}`,
          type: "transfer",
          date: transfer.operation_date || transfer.created_at,
          operation_date: transfer.operation_date || transfer.created_at,
          amount: transfer.amount,
          description: transfer.reason || `Transfert vers ${transfer.to_client}`,
          status: transfer.status || "completed",
          fromClient: transfer.from_client,
          toClient: transfer.to_client,
          createdAt: transfer.created_at
        })),
        
        // Incoming transfers
        ...(toTransfersResult.data || []).map((transfer): Operation => ({
          id: `transfer-in-${transfer.id}`,
          type: "transfer",
          date: transfer.operation_date || transfer.created_at,
          operation_date: transfer.operation_date || transfer.created_at,
          amount: transfer.amount,
          description: transfer.reason || `Transfert de ${transfer.from_client}`,
          status: transfer.status || "completed",
          fromClient: transfer.from_client,
          toClient: transfer.to_client,
          createdAt: transfer.created_at
        })),
        
        // Outgoing direct operations
        ...(fromDirectOpsResult.data || []).map((operation): Operation => ({
          id: `direct-${operation.id}`,
          type: "direct_transfer",
          date: operation.operation_date || operation.created_at,
          operation_date: operation.operation_date || operation.created_at,
          amount: operation.amount,
          description: operation.notes || `Opération directe vers ${operation.to_client_name}`,
          status: operation.status || "completed",
          fromClient: operation.from_client_name,
          toClient: operation.to_client_name,
          createdAt: operation.created_at
        })),
        
        // Incoming direct operations
        ...(toDirectOpsResult.data || []).map((operation): Operation => ({
          id: `direct-in-${operation.id}`,
          type: "direct_transfer",
          date: operation.operation_date || operation.created_at,
          operation_date: operation.operation_date || operation.created_at,
          amount: operation.amount,
          description: operation.notes || `Opération directe de ${operation.from_client_name}`,
          status: operation.status || "completed",
          fromClient: operation.from_client_name,
          toClient: operation.to_client_name,
          createdAt: operation.created_at
        }))
      ];

      // Remove duplicates based on unique ID
      const uniqueOperations = removeDuplicateOperations(allOperations);

      // Sort by date (newest first)
      uniqueOperations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log(`ClientSpecificOperations - Total unique operations for ${clientName}: ${uniqueOperations.length}`);
      console.log("ClientSpecificOperations - Operation types breakdown:", {
        deposits: uniqueOperations.filter(op => op.type === 'deposit').length,
        withdrawals: uniqueOperations.filter(op => op.type === 'withdrawal').length,
        transfers: uniqueOperations.filter(op => op.type === 'transfer').length,
        direct_transfers: uniqueOperations.filter(op => op.type === 'direct_transfer').length
      });

      setOperations(uniqueOperations);
    } catch (err: any) {
      console.error("ClientSpecificOperations - Error:", err);
      setError(err.message || "Erreur lors de la récupération des opérations");
      setOperations([]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, clientName]);

  const refreshOperations = useCallback(async (): Promise<void> => {
    await fetchClientOperations();
  }, [fetchClientOperations]);

  useEffect(() => {
    fetchClientOperations();
  }, [fetchClientOperations]);

  return {
    operations,
    isLoading,
    error,
    refreshOperations
  };
};

// Helper function to remove duplicate operations based on ID
function removeDuplicateOperations(operations: Operation[]): Operation[] {
  const uniqueOps = new Map<string, Operation>();
  
  for (const operation of operations) {
    if (!uniqueOps.has(operation.id)) {
      uniqueOps.set(operation.id, operation);
    }
  }
  
  return Array.from(uniqueOps.values());
}
