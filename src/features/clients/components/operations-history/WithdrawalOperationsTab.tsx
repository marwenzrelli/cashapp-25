
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

      {/* Mobile version - with improved containment */}
      <div className="md:hidden w-full">
        <div className="grid grid-cols-1 gap-2">
          {withdrawals.map((operation) => (
            <div key={operation.id} className="w-full max-w-full overflow-hidden">
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {format(new Date(operation.operation_date || operation.date), "dd/MM/yyyy")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(operation.operation_date || operation.date), "HH:mm")}
                  </span>
                </div>
                
                <div className="max-w-[40%] truncate">
                  <span className="text-sm">{operation.description}</span>
                </div>
                
                <div className="text-right">
                  <span className="text-base font-medium text-red-600 dark:text-red-400">
                    -{Math.round(operation.amount)} {currency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
