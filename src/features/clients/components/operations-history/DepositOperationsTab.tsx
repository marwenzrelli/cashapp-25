
import React from "react";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { EmptyOperations } from "./EmptyOperations";
import { formatDateTime } from "@/features/deposits/hooks/utils/dateUtils";

interface DepositOperationsTabProps {
  operations: Operation[];
  currency?: string;
}

export const DepositOperationsTab = ({ operations, currency = "TND" }: DepositOperationsTabProps) => {
  const deposits = operations.filter(op => op.type === "deposit");
  
  if (deposits.length === 0) {
    return <EmptyOperations type="deposit" />;
  }

  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Montant</TableHead>
              <TableHead>Client</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell>
                  {operation.operation_date 
                    ? formatDateTime(operation.operation_date) 
                    : formatDateTime(operation.date)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                <TableCell className="text-center font-medium text-green-600 dark:text-green-400">
                  {Math.round(operation.amount)} {currency}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{operation.fromClient}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3">
        {deposits.map((operation) => (
          <OperationsMobileCard 
            key={operation.id} 
            operation={operation} 
            currency={currency}
            showType={false}
            colorClass="text-green-600"
          />
        ))}
      </div>
    </>
  );
};
