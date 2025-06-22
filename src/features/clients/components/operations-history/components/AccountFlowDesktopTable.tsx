
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { CardContent } from "@/components/ui/card";

interface ProcessedOperation {
  id: string | number;
  type: string;
  date: string;
  operation_date?: string;
  amount: number;
  description?: string;
  balanceBefore: number;
  balanceAfter: number;
  balanceChange: number;
}

interface AccountFlowDesktopTableProps {
  processedOperations: ProcessedOperation[];
  clientFullName: string;
  isPublicView?: boolean;
}

export const AccountFlowDesktopTable = ({ 
  processedOperations, 
  clientFullName,
  isPublicView = false
}: AccountFlowDesktopTableProps) => {
  console.log("AccountFlowDesktopTable - Rendering", processedOperations?.length || 0, "operations");
  console.log("AccountFlowDesktopTable - IsPublicView:", isPublicView);

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: fr });
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number): string => {
    return Math.abs(amount).toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    });
  };

  const getBalanceClass = (balance: number) => {
    return balance >= 0 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";
  };

  const getAmountDisplay = (op: ProcessedOperation) => {
    // Show the actual balance change with proper sign
    const sign = op.balanceChange >= 0 ? "+" : "-";
    return `${sign} ${formatAmount(Math.abs(op.balanceChange))} TND`;
  };

  const getAmountClassForOperation = (op: ProcessedOperation) => {
    if (op.balanceChange > 0) return "text-green-600 dark:text-green-400";
    if (op.balanceChange < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="hidden md:block">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">#</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[150px] text-right">Solde avant</TableHead>
                <TableHead className="w-[120px] text-right">Montant</TableHead>
                <TableHead className="w-[150px] text-right">Solde après</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedOperations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {!clientFullName ? (
                      <div className="text-orange-600">
                        Client non trouvé. Vérifiez que le client existe.
                      </div>
                    ) : (
                      "Aucune opération trouvée pour ce client"
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                processedOperations.map((op, index) => {
                  // Calculer le numéro chronologique (inverse de l'index d'affichage)
                  const chronologicalNumber = processedOperations.length - index;
                  
                  return (
                    <TableRow key={`${op.id}-${index}`} className="hover:bg-muted/50">
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {chronologicalNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatDateTime(op.operation_date || op.date)}
                      </TableCell>
                      <TableCell>{op.id.toString().split('-')[1] || op.id}</TableCell>
                      <TableCell>
                        <Badge className={`${getTypeStyle(op.type)} flex w-fit items-center gap-1`}>
                          {getTypeIcon(op.type)}
                          {getTypeLabel(op.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {op.description || "-"}
                      </TableCell>
                      <TableCell className={`text-right ${getBalanceClass(op.balanceBefore)}`}>
                        {formatAmount(op.balanceBefore)} TND
                      </TableCell>
                      <TableCell className={`text-right ${getAmountClassForOperation(op)}`}>
                        {getAmountDisplay(op)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${getBalanceClass(op.balanceAfter)}`}>
                        {formatAmount(op.balanceAfter)} TND
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </div>
  );
};
