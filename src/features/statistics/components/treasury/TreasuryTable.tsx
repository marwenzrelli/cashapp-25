
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
  systemBalance: number;
}

interface TreasuryOperation extends Operation {
  balanceBefore: number;
  balanceAfter: number;
  treasuryImpact: number;
  displayType: 'deposit' | 'withdrawal' | 'transfer_out' | 'transfer_in';
  isTransferPair?: boolean;
}

export const TreasuryTable = ({
  operations,
  onDataRefresh,
  systemBalance
}: TreasuryTableProps) => {
  const { sortedOperations, sortConfig, handleSort } = useTreasurySorting(operations);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncWithDatabase = async () => {
    setIsSyncing(true);
    try {
      console.log("Synchronisation avec la base de données...");

      // Récupérer toutes les données depuis la base (y compris les incomplètes)
      const [depositsResult, withdrawalsResult, transfersResult] = await Promise.all([
        supabase
          .from('deposits')
          .select('*')
          .order('operation_date', { ascending: false }),
        supabase
          .from('withdrawals')
          .select('*')
          .order('operation_date', { ascending: false }),
        supabase
          .from('transfers')
          .select('*')
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

  const expandedOperations = useMemo(() => {
    // Créer une liste étendue où chaque virement devient deux lignes
    const expanded: Operation[] = [];
    
    sortedOperations.forEach(operation => {
      if (operation.type === 'transfer') {
        // Ligne de sortie (débit)
        expanded.push({
          ...operation,
          id: `${operation.id}-out`,
          type: 'transfer' as const,
          displayType: 'transfer_out' as const,
          description: `${operation.description} (Sortie: ${operation.fromClient})`,
          fromClient: operation.fromClient,
          toClient: operation.toClient
        });
        
        // Ligne d'entrée (crédit)
        expanded.push({
          ...operation,
          id: `${operation.id}-in`,
          type: 'transfer' as const,
          displayType: 'transfer_in' as const,
          description: `${operation.description} (Entrée: ${operation.toClient})`,
          fromClient: operation.fromClient,
          toClient: operation.toClient
        });
      } else {
        expanded.push({
          ...operation,
          displayType: operation.type as any
        });
      }
    });

    return expanded;
  }, [sortedOperations]);

  const operationsWithBalance = useMemo(() => {
    console.log(`TreasuryTable calculant les soldes pour ${expandedOperations.length} opérations étendues`);
    console.log(`Solde système de référence: ${systemBalance}`);

    // Calculer d'abord l'impact total de trésorerie pour déterminer le solde de départ
    let totalTreasuryImpact = 0;
    expandedOperations.forEach(op => {
      const displayType = op.displayType || op.type;
      if (displayType === 'deposit') {
        totalTreasuryImpact += op.amount;
      } else if (displayType === 'withdrawal') {
        totalTreasuryImpact -= op.amount;
      }
      // Les virements (transfer_out et transfer_in) n'impactent pas le total de trésorerie
    });

    // Le solde de départ doit être calculé pour que le solde final corresponde au solde système
    const startingBalance = systemBalance - totalTreasuryImpact;
    
    console.log(`Impact total de trésorerie: ${totalTreasuryImpact}`);
    console.log(`Solde de départ calculé: ${startingBalance}`);

    let runningBalance = startingBalance;
    
    return expandedOperations.map((op): TreasuryOperation => {
      const balanceBefore = runningBalance;
      const displayType = op.displayType || op.type;
      let treasuryImpact = 0;
      
      if (displayType === 'deposit') {
        treasuryImpact = op.amount; // Entrée d'argent
      } else if (displayType === 'withdrawal') {
        treasuryImpact = -op.amount; // Sortie d'argent
      } else if (displayType === 'transfer_out') {
        treasuryImpact = 0; // Mouvement interne - neutre pour la trésorerie
      } else if (displayType === 'transfer_in') {
        treasuryImpact = 0; // Mouvement interne - neutre pour la trésorerie
      }
      
      runningBalance += treasuryImpact;
      
      return {
        ...op,
        balanceBefore,
        balanceAfter: runningBalance,
        treasuryImpact,
        displayType: displayType as 'deposit' | 'withdrawal' | 'transfer_out' | 'transfer_in',
        isTransferPair: op.type === 'transfer'
      };
    });
  }, [expandedOperations, systemBalance]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const getOperationNatureBadge = (displayType: string) => {
    switch (displayType) {
      case 'deposit':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Versement</Badge>;
      case 'withdrawal':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Retrait</Badge>;
      case 'transfer_out':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">Virement (Sortie)</Badge>;
      case 'transfer_in':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Virement (Entrée)</Badge>;
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

  const getAmountClass = (displayType: string) => {
    switch (displayType) {
      case "withdrawal":
      case "transfer_out":
        return "text-red-600 font-semibold font-mono";
      case "deposit":
      case "transfer_in":
        return "text-green-600 font-semibold font-mono";
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

  // Fonction pour formater le montant selon le type d'opération pour l'affichage
  const formatOperationAmount = (operation: TreasuryOperation) => {
    if (operation.displayType === "withdrawal" || operation.displayType === "transfer_out") {
      return formatCurrency(-operation.amount);
    } else if (operation.displayType === "deposit" || operation.displayType === "transfer_in") {
      return formatCurrency(operation.amount);
    } else {
      return formatCurrency(operation.amount);
    }
  };

  const getClientDisplay = (operation: TreasuryOperation) => {
    if (operation.displayType === "transfer_out") {
      return operation.fromClient;
    } else if (operation.displayType === "transfer_in") {
      return operation.toClient;
    } else {
      return operation.fromClient;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Livre de trésorerie</h3>
          <p className="text-sm text-muted-foreground">
            {operationsWithBalance.length} opération{operationsWithBalance.length > 1 ? 's' : ''} affichée{operationsWithBalance.length > 1 ? 's' : ''} (virements dédoublés)
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
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Solde avant</TableHead>
              <TableHead className="text-right">Impact Trésorerie</TableHead>
              <TableHead className="text-right">Solde après</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operationsWithBalance.length > 0 ? operationsWithBalance.map((operation, index) => (
              <TableRow 
                key={operation.id}
                className={operation.isTransferPair ? "bg-blue-50/30 dark:bg-blue-950/10" : ""}
              >
                <TableCell>
                  {format(new Date(operation.operation_date || operation.date), "dd/MM/yyyy HH:mm", {
                    locale: fr
                  })}
                </TableCell>
                <TableCell>{operation.id}</TableCell>
                <TableCell>{getOperationNatureBadge(operation.displayType)}</TableCell>
                <TableCell>
                  {getClientDisplay(operation)}
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
                <TableCell className={`text-right ${getAmountClass(operation.displayType)}`}>
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
    </div>
  );
};
