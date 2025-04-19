
import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TreasuryTableProps {
  operations: Operation[];
}

interface TreasuryOperation extends Operation {
  balanceBefore: number;
  balanceAfter: number;
}

export const TreasuryTable = ({ operations }: TreasuryTableProps) => {
  const sortedOperations = useMemo(() => {
    let runningBalance = 0;
    return [...operations]
      .sort((a, b) => {
        const dateA = new Date(a.operation_date || a.date);
        const dateB = new Date(b.operation_date || b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .map((op): TreasuryOperation => {
        const amount = op.type === "withdrawal" ? -op.amount : op.amount;
        const balanceBefore = runningBalance;
        runningBalance += amount;
        return {
          ...op,
          balanceBefore,
          balanceAfter: runningBalance
        };
      });
  }, [operations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>ID Opération</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Désignation</TableHead>
            <TableHead className="text-right">Solde avant</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="text-right">Solde après</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOperations.map((operation) => (
            <TableRow key={operation.id}>
              <TableCell>
                {format(new Date(operation.operation_date || operation.date), "dd/MM/yyyy HH:mm", { locale: fr })}
              </TableCell>
              <TableCell>{operation.id}</TableCell>
              <TableCell>
                {operation.type === "transfer" 
                  ? `${operation.fromClient} → ${operation.toClient}`
                  : operation.fromClient}
              </TableCell>
              <TableCell>
                {operation.description || (
                  operation.type === "deposit" ? "Versement" :
                  operation.type === "withdrawal" ? "Retrait" :
                  "Virement"
                )}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(operation.balanceBefore)}
              </TableCell>
              <TableCell className={`text-right font-mono ${
                operation.type === "withdrawal" ? "text-red-600" : 
                operation.type === "deposit" ? "text-green-600" : 
                "text-blue-600"
              }`}>
                {formatCurrency(operation.type === "withdrawal" ? -operation.amount : operation.amount)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(operation.balanceAfter)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
