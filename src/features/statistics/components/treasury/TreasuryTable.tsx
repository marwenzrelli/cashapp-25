
import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTreasurySorting, SortField } from "../../hooks/useTreasurySorting";

interface TreasuryTableProps {
  operations: Operation[];
}

interface TreasuryOperation extends Operation {
  balanceBefore: number;
  balanceAfter: number;
}

export const TreasuryTable = ({
  operations
}: TreasuryTableProps) => {
  const { sortedOperations, sortConfig, handleSort } = useTreasurySorting(operations);

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
              <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                Aucune opération à afficher
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
