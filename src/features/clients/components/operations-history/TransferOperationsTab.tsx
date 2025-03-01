
import React from "react";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTypeStyle, getTypeIcon } from "@/features/operations/utils/operation-helpers";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { EmptyOperations } from "./EmptyOperations";

interface TransferOperationsTabProps {
  operations: Operation[];
  currency?: string;
}

export const TransferOperationsTab = ({ operations, currency = "TND" }: TransferOperationsTabProps) => {
  const transfers = operations.filter(op => op.type === "transfer");
  
  if (transfers.length === 0) {
    return <EmptyOperations type="transfer" />;
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
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>De</TableHead>
              <TableHead>À</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((operation) => (
              <TableRow key={operation.id}>
                <TableCell>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</TableCell>
                <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                  {Math.round(operation.amount)} {currency}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{operation.fromClient}</TableCell>
                <TableCell className="max-w-[200px] truncate">{operation.toClient}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3">
        {transfers.map((operation) => (
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
