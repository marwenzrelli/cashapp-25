
import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, RefreshCw } from "lucide-react";
import { useTreasurySorting, SortField } from "../../hooks/useTreasurySorting";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TreasuryTableProps {
  operations: Operation[];
  onDataRefresh?: (newOperations: Operation[]) => void;
}

interface TreasuryOperation extends Operation {
  balanceBefore: number;
  balanceAfter: number;
}

export const TreasuryTable = ({
  operations,
  onDataRefresh
}: TreasuryTableProps) => {
  const { sortedOperations, sortConfig, handleSort } = useTreasurySorting(operations);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncWithDatabase = async () => {
    setIsSyncing(true);
    try {
      console.log("Synchronisation avec la base de données...");

      // Récupérer toutes les données depuis la base
      const [depositsResult, withdrawalsResult, transfersResult] = await Promise.all([
        supabase
          .from('deposits')
          .select('*')
          .eq('status', 'completed')
          .order('operation_date', { ascending: false }),
        supabase
          .from('withdrawals')
          .select('*')
          .eq('status', 'completed')
          .order('operation_date', { ascending: false }),
        supabase
          .from('transfers')
          .select('*')
          .eq('status', 'completed')
          .order('operation_date', { ascending: false })
      ]);

      if (depositsResult.error) throw depositsResult.error;
      if (withdrawalsResult.error) throw withdrawalsResult.error;
      if (transfersResult.error) throw transfersResult.error;

      // Transformer les données en format Operation
      const transformedDeposits: Operation[] = depositsResult.data.map(deposit => ({
        id: `dep-${deposit.id}`,
        type: 'deposit' as const,
        amount: deposit.amount,
        date: deposit.operation_date || deposit.created_at,
        operation_date: deposit.operation_date || deposit.created_at,
        description: deposit.notes || 'Versement',
        fromClient: deposit.client_name,
        status: deposit.status
      }));

      const transformedWithdrawals: Operation[] = withdrawalsResult.data.map(withdrawal => ({
        id: `wit-${withdrawal.id}`,
        type: 'withdrawal' as const,
        amount: withdrawal.amount,
        date: withdrawal.operation_date || withdrawal.created_at,
        operation_date: withdrawal.operation_date || withdrawal.created_at,
        description: withdrawal.notes || 'Retrait',
        fromClient: withdrawal.client_name,
        status: withdrawal.status
      }));

      const transformedTransfers: Operation[] = transfersResult.data.map(transfer => ({
        id: `tra-${transfer.id}`,
        type: 'transfer' as const,
        amount: transfer.amount,
        date: transfer.operation_date || transfer.created_at,
        operation_date: transfer.operation_date || transfer.created_at,
        description: transfer.reason || 'Virement',
        fromClient: transfer.from_client,
        toClient: transfer.to_client,
        status: transfer.status
      }));

      // Combiner et trier toutes les opérations
      const allOperations = [...transformedDeposits, ...transformedWithdrawals, ...transformedTransfers];
      const sortedByDate = allOperations.sort((a, b) => {
        const dateA = new Date(a.operation_date || a.date);
        const dateB = new Date(b.operation_date || b.date);
        return dateA.getTime() - dateB.getTime(); // Tri chronologique pour calculer le solde
      });

      console.log(`Synchronisation terminée: ${sortedByDate.length} opérations récupérées`);
      
      // Notifier le parent des nouvelles données
      if (onDataRefresh) {
        onDataRefresh(sortedByDate);
      }

      toast.success(`Données synchronisées: ${sortedByDate.length} opérations`);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur lors de la synchronisation des données');
    } finally {
      setIsSyncing(false);
    }
  };

  const operationsWithBalance = useMemo(() => {
    // Log initial input to verify we're receiving all operation types
    const depositCount = operations.filter(op => op.type === 'deposit').length;
    const withdrawalCount = operations.filter(op => op.type === 'withdrawal').length;
    const transferCount = operations.filter(op => op.type === 'transfer').length;
    console.log(`TreasuryTable received ${operations.length} operations:`, {
      deposits: depositCount,
      withdrawals: withdrawalCount,
      transfers: transferCount
    });

    let runningBalance = 0;
    return sortedOperations.map((op): TreasuryOperation => {
      const amount = op.type === "withdrawal" ? -op.amount : op.amount;
      const balanceBefore = runningBalance;
      runningBalance += amount;
      return {
        ...op,
        balanceBefore,
        balanceAfter: runningBalance
      };
    });
  }, [sortedOperations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const getOperationNatureBadge = (type: Operation['type']) => {
    switch (type) {
      case 'deposit':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Versement</Badge>;
      case 'withdrawal':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Retrait</Badge>;
      case 'transfer':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Virement</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getBalanceClass = (amount: number) => {
    if (amount > 0) {
      return "text-green-600 font-semibold font-mono";
    } else if (amount < 0) {
      return "text-red-600 font-semibold font-mono";
    }
    return "font-semibold font-mono";
  };

  const getAmountClass = (type: Operation['type']) => {
    switch (type) {
      case "withdrawal":
        return "text-red-600 font-semibold font-mono";
      case "deposit":
        return "text-green-600 font-semibold font-mono";
      case "transfer":
        return "text-blue-600 font-semibold font-mono";
      default:
        return "font-semibold font-mono";
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronUp className="h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === "asc" 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(field)}
        className="h-auto p-0 font-medium hover:bg-transparent flex items-center gap-2"
      >
        {children}
        {getSortIcon(field)}
      </Button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Livre de trésorerie</h3>
          <p className="text-sm text-muted-foreground">
            {operationsWithBalance.length} opération{operationsWithBalance.length > 1 ? 's' : ''} affichée{operationsWithBalance.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={syncWithDatabase}
          disabled={isSyncing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
        </Button>
      </div>

      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="date">Date</SortableHeader>
              <SortableHeader field="id">ID Opération</SortableHeader>
              <SortableHeader field="nature">Nature</SortableHeader>
              <SortableHeader field="client">Client</SortableHeader>
              <TableHead>Désignation</TableHead>
              <TableHead className="text-right">Solde avant</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="text-right">Solde après</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operationsWithBalance.length > 0 ? operationsWithBalance.map(operation => (
              <TableRow key={operation.id}>
                <TableCell>
                  {format(new Date(operation.operation_date || operation.date), "dd/MM/yyyy HH:mm", {
                    locale: fr
                  })}
                </TableCell>
                <TableCell>{operation.id}</TableCell>
                <TableCell>{getOperationNatureBadge(operation.type)}</TableCell>
                <TableCell>
                  {operation.type === "transfer" ? `${operation.fromClient} → ${operation.toClient}` : operation.fromClient}
                </TableCell>
                <TableCell>
                  {operation.description || ""}
                </TableCell>
                <TableCell className={`text-right ${getBalanceClass(operation.balanceBefore)}`}>
                  {formatCurrency(operation.balanceBefore)}
                </TableCell>
                <TableCell className={`text-right ${getAmountClass(operation.type)}`}>
                  {formatCurrency(operation.type === "withdrawal" ? -operation.amount : operation.amount)}
                </TableCell>
                <TableCell className={`text-right ${getBalanceClass(operation.balanceAfter)}`}>
                  {formatCurrency(operation.balanceAfter)}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  Aucune opération à afficher
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
