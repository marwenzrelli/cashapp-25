
import React from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { EmptyOperations } from "./EmptyOperations";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { formatId } from "@/utils/formatId";
import { format } from "date-fns";

interface TransferOperationsTabProps {
  operations: Operation[];
  currency?: string;
}

export const TransferOperationsTab = ({ operations, currency = "TND" }: TransferOperationsTabProps) => {
  // Filter only transfer operations
  const transferOperations = operations.filter(
    (operation) => operation.type === "transfer"
  );

  if (transferOperations.length === 0) {
    return <EmptyOperations />;
  }

  // Calculate total for transfers
  const totalTransfers = transferOperations.reduce((total, op) => total + op.amount, 0);

  // Format number with 2 decimal places and comma separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>De</TableHead>
              <TableHead></TableHead>
              <TableHead>À</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transferOperations.map((operation) => {
              // Use operation_date if available, otherwise fall back to date
              const displayDate = operation.operation_date || operation.date;
              const formattedDate = typeof displayDate === 'string' 
                ? format(new Date(displayDate), "dd/MM/yyyy HH:mm") 
                : format(displayDate, "dd/MM/yyyy HH:mm");
              
              // Format operation ID
              const operationId = isNaN(parseInt(operation.id)) 
                ? operation.id 
                : formatId(parseInt(operation.id));
                
              return (
                <TableRow key={operation.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{operationId}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formattedDate}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{operation.fromClient}</TableCell>
                  <TableCell className="px-0 text-center">
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{operation.toClient}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                  <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                    {formatNumber(operation.amount)} {currency}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {/* Totals section for desktop */}
            <TableRow className="border-t-2 border-primary/20">
              <TableCell colSpan={5} className="font-medium">Total des virements:</TableCell>
              <TableCell colSpan={1}></TableCell>
              <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                {formatNumber(totalTransfers)} {currency}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 w-full">
        {transferOperations.map((operation) => (
          <OperationsMobileCard 
            key={operation.id} 
            operation={operation}
            formatAmount={(amount) => `${formatNumber(amount)}`}
            currency={currency}
            colorClass="text-blue-600 dark:text-blue-400"
            showType={false}
          />
        ))}
        
        {/* Totals section for mobile */}
        <div className="mt-8 border-t-2 border-primary/20 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total des virements:</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {formatNumber(totalTransfers)} {currency}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
