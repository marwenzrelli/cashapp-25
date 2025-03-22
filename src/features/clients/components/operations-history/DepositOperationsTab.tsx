
import React from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { EmptyOperations } from "./EmptyOperations";
import { formatId } from "@/utils/formatId";
import { format } from "date-fns";

interface DepositOperationsTabProps {
  operations: Operation[];
  currency?: string;
}

export const DepositOperationsTab = ({ operations, currency = "TND" }: DepositOperationsTabProps) => {
  // Filter only deposit operations
  const depositOperations = operations.filter(
    (operation) => operation.type === "deposit"
  );

  if (depositOperations.length === 0) {
    return <EmptyOperations />;
  }

  // Calculate total for deposits
  const totalDeposits = depositOperations.reduce((total, op) => total + op.amount, 0);

  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {depositOperations.map((operation) => {
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
                  <TableCell className="max-w-[200px] truncate">{operation.fromClient}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{operation.description}</TableCell>
                  <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                    +{Math.round(operation.amount).toLocaleString()} {currency}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {/* Totals section for desktop */}
            <TableRow className="border-t-2 border-primary/20">
              <TableCell colSpan={3} className="font-medium">Total des versements:</TableCell>
              <TableCell colSpan={1}></TableCell>
              <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                +{totalDeposits.toLocaleString()} {currency}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 w-full">
        {depositOperations.map((operation) => (
          <OperationsMobileCard 
            key={operation.id} 
            operation={operation}
            formatAmount={(amount) => `+${Math.round(amount)}`}
            currency={currency}
            colorClass="text-green-600 dark:text-green-400"
            showType={false}
          />
        ))}
        
        {/* Totals section for mobile */}
        <div className="mt-8 border-t-2 border-primary/20 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total des versements:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              +{totalDeposits.toLocaleString()} {currency}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
