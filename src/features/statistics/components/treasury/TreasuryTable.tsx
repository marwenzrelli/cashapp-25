
import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTreasurySorting, SortField } from "../../hooks/useTreasurySorting";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchAllRows } from "../../utils/fetchAllRows";
import { logger } from "@/utils/logger";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const syncAllOperations = async () => {
    setIsSyncing(true);
    try {
      logger.log("Synchronisation de TOUTES les opérations...");

      // Récupérer TOUTES les données depuis la base (sans limite)
      const [depositsData, withdrawalsData, transfersData, directOpsData] = await Promise.all([
        fetchAllRows('deposits', { orderBy: 'operation_date', ascending: true }),
        fetchAllRows('withdrawals', { orderBy: 'operation_date', ascending: true }),
        fetchAllRows('transfers', { orderBy: 'operation_date', ascending: true }),
        fetchAllRows('direct_operations', { orderBy: 'operation_date', ascending: true })
      ]);

      // Transformer les données en format Operation
      const transformedDeposits: Operation[] = (depositsData || []).map((deposit: any) => ({
        id: `dep-${deposit.id}`,
        type: 'deposit' as const,
        amount: deposit.amount,
        date: deposit.operation_date || deposit.created_at,
        operation_date: deposit.operation_date || deposit.created_at,
        description: deposit.notes || 'Versement',
        fromClient: deposit.client_name,
        status: deposit.status || 'completed'
      }));

      const transformedWithdrawals: Operation[] = (withdrawalsData || []).map((withdrawal: any) => ({
        id: `wit-${withdrawal.id}`,
        type: 'withdrawal' as const,
        amount: withdrawal.amount,
        date: withdrawal.operation_date || withdrawal.created_at,
        operation_date: withdrawal.operation_date || withdrawal.created_at,
        description: withdrawal.notes || 'Retrait',
        fromClient: withdrawal.client_name,
        status: withdrawal.status || 'completed'
      }));

      const transformedTransfers: Operation[] = (transfersData || []).map((transfer: any) => ({
        id: `tra-${transfer.id}`,
        type: 'transfer' as const,
        amount: transfer.amount,
        date: transfer.operation_date || transfer.created_at,
        operation_date: transfer.operation_date || transfer.created_at,
        description: transfer.reason || 'Virement',
        fromClient: transfer.from_client,
        toClient: transfer.to_client,
        status: transfer.status || 'completed'
      }));

      const transformedDirectOps: Operation[] = (directOpsData || []).map((directOp: any) => ({
        id: `direct-${directOp.id}`,
        type: 'direct_transfer' as const,
        amount: directOp.amount,
        date: directOp.operation_date || directOp.created_at,
        operation_date: directOp.operation_date || directOp.created_at,
        description: directOp.notes || `Opération directe: ${directOp.from_client_name} → ${directOp.to_client_name}`,
        fromClient: directOp.from_client_name,
        toClient: directOp.to_client_name,
        status: directOp.status || 'completed'
      }));

      // Combiner et trier toutes les opérations par date chronologique
      const allOperations = [...transformedDeposits, ...transformedWithdrawals, ...transformedTransfers, ...transformedDirectOps];
      const sortedByDate = allOperations.sort((a, b) => {
        const dateA = new Date(a.operation_date || a.date);
        const dateB = new Date(b.operation_date || b.date);
        return dateA.getTime() - dateB.getTime();
      });

      logger.log(`Synchronisation terminée: ${sortedByDate.length} opérations récupérées`);
      logger.log(`- Versements: ${transformedDeposits.length}`);
      logger.log(`- Retraits: ${transformedWithdrawals.length}`);
      logger.log(`- Virements: ${transformedTransfers.length}`);
      logger.log(`- Opérations directes: ${transformedDirectOps.length}`);
      
      // Notifier le parent des nouvelles données
      if (onDataRefresh) {
        onDataRefresh(sortedByDate);
      }

      toast.success(`Toutes les opérations synchronisées: ${sortedByDate.length} opérations`);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur lors de la synchronisation des données');
    } finally {
      setIsSyncing(false);
    }
  };

  const operationsWithBalance = useMemo(() => {
    logger.log(`TreasuryTable: Calcul des soldes pour ${operations.length} opérations`);
    
    let runningBalance = 0;
    return sortedOperations.map((op, index): TreasuryOperation => {
      const balanceBefore = runningBalance;
      
      // Calcul correct: dépôts et retraits affectent la trésorerie, opérations directes aussi
      let balanceChange = 0;
      if (op.type === "deposit") {
        balanceChange = op.amount; // Entrée d'argent
      } else if (op.type === "withdrawal") {
        balanceChange = -op.amount; // Sortie d'argent
      }
      // Les virements et opérations directes sont neutres pour la trésorerie globale
      
      runningBalance += balanceChange;
      
      logger.log(`Opération ${index + 1}: ${op.type} ${op.amount} -> Solde: ${balanceBefore} -> ${runningBalance}`);
      
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
      case 'direct_transfer':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Op. Directe</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Complété</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">En attente</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Annulé</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">{status}</Badge>;
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
      case "direct_transfer":
        return "text-purple-600 font-semibold font-mono";
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

  // Fonction pour formater le montant selon le type d'opération
  const formatOperationAmount = (operation: TreasuryOperation) => {
    if (operation.type === "withdrawal") {
      return formatCurrency(-operation.amount);
    } else if (operation.type === "transfer" || operation.type === "direct_transfer") {
      return formatCurrency(0); // Neutre pour la trésorerie
    } else {
      return formatCurrency(operation.amount);
    }
  };

  // Pagination
  const totalPages = Math.ceil(operationsWithBalance.length / pageSize);
  const paginatedOperations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return operationsWithBalance.slice(start, start + pageSize);
  }, [operationsWithBalance, currentPage, pageSize]);

  // Reset page when operations change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [operations.length, pageSize]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">Livre de trésorerie</h3>
          <p className="text-sm text-muted-foreground">
            {operationsWithBalance.length} opération{operationsWithBalance.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 par page</SelectItem>
              <SelectItem value="50">50 par page</SelectItem>
              <SelectItem value="100">100 par page</SelectItem>
              <SelectItem value="200">200 par page</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={syncAllOperations}
            disabled={isSyncing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sync...' : 'Synchroniser'}
          </Button>
        </div>
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
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Solde avant</TableHead>
              <TableHead className="text-right">Impact Trésorerie</TableHead>
              <TableHead className="text-right">Solde après</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOperations.length > 0 ? paginatedOperations.map(operation => (
              <TableRow key={operation.id}>
                <TableCell>
                  {format(new Date(operation.operation_date || operation.date), "dd/MM/yyyy HH:mm", {
                    locale: fr
                  })}
                </TableCell>
                <TableCell>{operation.id}</TableCell>
                <TableCell>{getOperationNatureBadge(operation.type)}</TableCell>
                <TableCell>
                  {(operation.type === "transfer" || operation.type === "direct_transfer") ? `${operation.fromClient} → ${operation.toClient}` : operation.fromClient}
                </TableCell>
                <TableCell>
                  {operation.description || ""}
                </TableCell>
                <TableCell>
                  {getStatusBadge(operation.status || 'completed')}
                </TableCell>
                <TableCell className={`text-right ${getBalanceClass(operation.balanceBefore)}`}>
                  {formatCurrency(operation.balanceBefore)}
                </TableCell>
                <TableCell className={`text-right ${getAmountClass(operation.type)}`}>
                  {formatOperationAmount(operation)}
                </TableCell>
                <TableCell className={`text-right ${getBalanceClass(operation.balanceAfter)}`}>
                  {formatCurrency(operation.balanceAfter)}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                  Aucune opération à afficher
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} — Opérations {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, operationsWithBalance.length)} sur {operationsWithBalance.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-medium">{currentPage} / {totalPages}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
