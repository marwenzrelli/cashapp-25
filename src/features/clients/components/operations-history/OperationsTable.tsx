
import React from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getTypeLabel, getTypeIcon, getTypeStyle } from "@/features/operations/utils/operation-helpers";
import { getAmountColor } from "@/features/operations/utils/display-helpers";

interface OperationsTableProps {
  operations: Operation[];
}

export const OperationsTable = ({ operations }: OperationsTableProps) => {
  // Format number with locale and 2 decimal places
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  // Function to format the operation ID as a 6-digit number
  const formatOperationId = (id: string): string => {
    // Extract numeric part from the operation ID
    const numericId = id.split('-').pop() || '';
    // Pad with leading zeros to get 6 digits
    return numericId.padStart(6, '0');
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap w-[80px]">ID</TableHead>
            <TableHead className="whitespace-nowrap">Type</TableHead>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="whitespace-nowrap text-right">Montant</TableHead>
            <TableHead className="whitespace-nowrap">Client</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((operation) => (
            <TableRow key={operation.id}>
              <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                {formatOperationId(operation.id)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                    {getTypeIcon(operation.type)}
                  </div>
                  <span>{getTypeLabel(operation.type)}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {operation.formattedDate || new Date(operation.operation_date || operation.date).toLocaleDateString()}
              </TableCell>
              <TableCell className="max-w-[250px] truncate">{operation.description}</TableCell>
              <TableCell className={cn("font-medium whitespace-nowrap text-right", getAmountColor(operation.type))}>
                {operation.type === "withdrawal" || (operation.type === "transfer" && operation.amount < 0) ? "-" : "+"}
                {formatNumber(Math.abs(operation.amount))} €
              </TableCell>
              <TableCell className="max-w-[150px]">
                {operation.type === "transfer" ? (
                  <div className="flex flex-col">
                    <span className="text-sm truncate">De: {operation.fromClient}</span>
                    <span className="text-sm truncate">À: {operation.toClient}</span>
                  </div>
                ) : (
                  <span className="truncate">{operation.fromClient}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
