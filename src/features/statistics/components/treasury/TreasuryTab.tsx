
import React, { useEffect, useState, useCallback } from "react";
import { TreasuryTable } from "./TreasuryTable";
import { TreasurySummary } from "./TreasurySummary";
import { TreasuryAnalysis } from "./TreasuryAnalysis";
import { Operation } from "@/features/operations/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchAllRows } from "../../utils/fetchAllRows";
import { logger } from "@/utils/logger";

interface TreasuryTabProps {
  operations: Operation[];
  isLoading: boolean;
}

export const TreasuryTab = ({ operations, isLoading }: TreasuryTabProps) => {
  const [localOperations, setLocalOperations] = useState<Operation[]>([]);
  const [systemBalance, setSystemBalance] = useState<number>(0);
  const [isFetchingAll, setIsFetchingAll] = useState(true);

  // Fetch ALL operations directly from DB (no limits)
  const fetchAllOperations = useCallback(async () => {
    setIsFetchingAll(true);
    try {
      logger.log("TreasuryTab: Fetching ALL operations from DB...");

      const [depositsData, withdrawalsData, transfersData, directOpsData] = await Promise.all([
        fetchAllRows('deposits', { orderBy: 'operation_date', ascending: true }),
        fetchAllRows('withdrawals', { orderBy: 'operation_date', ascending: true }),
        fetchAllRows('transfers', { orderBy: 'operation_date', ascending: true }),
        fetchAllRows('direct_operations', { orderBy: 'operation_date', ascending: true })
      ]);

      const transformedDeposits: Operation[] = (depositsData || []).map((deposit: any) => ({
        id: `dep-${deposit.id}`,
        type: 'deposit' as const,
        amount: deposit.amount,
        date: deposit.operation_date || deposit.created_at || new Date().toISOString(),
        operation_date: deposit.operation_date || deposit.created_at || new Date().toISOString(),
        description: deposit.notes || 'Versement',
        fromClient: deposit.client_name,
        client_id: deposit.client_id,
        status: deposit.status || 'completed'
      }));

      const transformedWithdrawals: Operation[] = (withdrawalsData || []).map((withdrawal: any) => ({
        id: `wit-${withdrawal.id}`,
        type: 'withdrawal' as const,
        amount: withdrawal.amount,
        date: withdrawal.operation_date || withdrawal.created_at || new Date().toISOString(),
        operation_date: withdrawal.operation_date || withdrawal.created_at || new Date().toISOString(),
        description: withdrawal.notes || 'Retrait',
        fromClient: withdrawal.client_name,
        client_id: withdrawal.client_id,
        status: withdrawal.status || 'completed'
      }));

      const transformedTransfers: Operation[] = (transfersData || []).map((transfer: any) => ({
        id: `tra-${transfer.id}`,
        type: 'transfer' as const,
        amount: transfer.amount,
        date: transfer.operation_date || transfer.created_at || new Date().toISOString(),
        operation_date: transfer.operation_date || transfer.created_at || new Date().toISOString(),
        description: transfer.reason || 'Virement',
        fromClient: transfer.from_client,
        toClient: transfer.to_client,
        status: transfer.status || 'completed'
      }));

      const transformedDirectOps: Operation[] = (directOpsData || []).map((directOp: any) => ({
        id: `direct-${directOp.id}`,
        type: 'direct_transfer' as const,
        amount: directOp.amount,
        date: directOp.operation_date || directOp.created_at || new Date().toISOString(),
        operation_date: directOp.operation_date || directOp.created_at || new Date().toISOString(),
        description: directOp.notes || `Opération directe: ${directOp.from_client_name} → ${directOp.to_client_name}`,
        fromClient: directOp.from_client_name,
        toClient: directOp.to_client_name,
        from_client_id: directOp.from_client_id,
        to_client_id: directOp.to_client_id,
        client_id: directOp.from_client_id,
        status: directOp.status || 'completed'
      }));

      const allOperations = [
        ...transformedDeposits,
        ...transformedWithdrawals,
        ...transformedTransfers,
        ...transformedDirectOps
      ].sort((a, b) => {
        const dateA = new Date(a.operation_date || a.date).getTime();
        const dateB = new Date(b.operation_date || b.date).getTime();
        return dateA - dateB;
      });

      logger.log(`TreasuryTab: Fetched ALL operations:
        - Versements: ${transformedDeposits.length}
        - Retraits: ${transformedWithdrawals.length}
        - Virements: ${transformedTransfers.length}
        - Opérations directes: ${transformedDirectOps.length}
        - Total: ${allOperations.length}`);

      setLocalOperations(allOperations);
    } catch (error) {
      console.error('Erreur lors du chargement des opérations:', error);
      toast.error('Erreur lors du chargement des opérations de trésorerie');
      // Fallback to props operations
      setLocalOperations(operations);
    } finally {
      setIsFetchingAll(false);
    }
  }, [operations]);

  // Fetch all on mount
  useEffect(() => {
    fetchAllOperations();
  }, []);

  // Calculer le solde système réel
  useEffect(() => {
    const calculateSystemBalance = async () => {
      try {
        const { data: clients, error } = await supabase
          .from('clients')
          .select('solde');

        if (error) throw error;

        const totalClientBalance = clients?.reduce((sum, client) => sum + (client.solde || 0), 0) || 0;
        setSystemBalance(totalClientBalance);
        
        logger.log(`Solde système calculé: ${totalClientBalance} TND`);
      } catch (error) {
        console.error('Erreur lors du calcul du solde système:', error);
      }
    };

    calculateSystemBalance();
  }, [localOperations]);

  const handleDataRefresh = (newOperations: Operation[]) => {
    logger.log(`TreasuryTab: Mise à jour avec ${newOperations.length} opérations`);
    setLocalOperations(newOperations);
  };

  // Calculer le solde final de trésorerie basé sur les opérations
  const finalTreasuryBalance = React.useMemo(() => {
    const deposits = localOperations.filter(op => op.type === 'deposit').reduce((sum, op) => sum + op.amount, 0);
    const withdrawals = localOperations.filter(op => op.type === 'withdrawal').reduce((sum, op) => sum + op.amount, 0);
    const treasuryBalance = deposits - withdrawals;
    
    logger.log(`Calcul final - Versements: ${deposits}, Retraits: ${withdrawals}, Balance: ${treasuryBalance}`);
    return treasuryBalance;
  }, [localOperations]);

  if (isLoading && isFetchingAll) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement des données de trésorerie...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TreasuryAnalysis />
      
      <TreasuryTable 
        operations={localOperations} 
        onDataRefresh={handleDataRefresh}
      />
      
      <TreasurySummary 
        operations={localOperations}
        finalTreasuryBalance={systemBalance}
      />
    </div>
  );
};
