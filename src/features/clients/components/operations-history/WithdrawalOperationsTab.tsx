
import React from "react";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { EmptyOperations } from "./EmptyOperations";

interface WithdrawalOperationsTabProps {
  operations: Operation[];
  currency?: string;
}

export const WithdrawalOperationsTab = ({ operations, currency = "TND" }: WithdrawalOperationsTabProps) => {
  const withdrawals = operations.filter(op => op.type === "withdrawal");
  
  if (withdrawals.length === 0) {
    return <EmptyOperations type="withdrawal" />;
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((operation) => {
              // Use operation_date if available, otherwise fall back to date
              const displayDate = operation.operation_date || operation.date;
              return (
                <TableRow key={operation.id}>
                  <TableCell>{format(new Date(displayDate), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                  <TableCell className="text-center font-medium text-red-600 dark:text-red-400">
                    -{Math.round(operation.amount)} {currency}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 w-full px-0 overflow-x-hidden">
        <div className="flex flex-col w-full max-w-full overflow-x-hidden">
          {withdrawals.map((operation) => (
            <OperationsMobileCard 
              key={operation.id} 
              operation={operation}
              formatAmount={(amount) => `${Math.round(amount)}`}
              currency={currency}
              showType={false}
              colorClass="text-red-600 dark:text-red-400"
            />
          ))}
        </div>
      </div>
    </>
  );
};
