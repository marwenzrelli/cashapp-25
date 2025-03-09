
import React from "react";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { EmptyOperations } from "./EmptyOperations";
import { getAmountColor } from "./utils";
import { formatId } from "@/utils/formatId";

interface AllOperationsTabProps {
  operations: Operation[];
  currency?: string;
}

export const AllOperationsTab = ({ operations, currency = "TND" }: AllOperationsTabProps) => {
  if (!operations || operations.length === 0) {
    return <EmptyOperations />;
  }

  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Montant</TableHead>
              {/* Only show transfer details column for transfer operations */}
              {operations.some(op => op.type === "transfer") && (
                <TableHead>Détails</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((operation) => {
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                        {getTypeIcon(operation.type)}
                      </div>
                      <span>{getTypeLabel(operation.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{operationId}
                  </TableCell>
                  <TableCell>{formattedDate}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                  <TableCell className={`text-center font-medium ${getAmountColor(operation.type)}`}>
                    {operation.type === "withdrawal" ? "-" : ""}{Math.round(operation.amount)} {currency}
                  </TableCell>
                  {/* Show transfer details only for transfers and if there are any transfers in the list */}
                  {operations.some(op => op.type === "transfer") && operation.type === "transfer" && (
                    <TableCell className="max-w-[200px] truncate">
                      {operation.fromClient} → {operation.toClient}
                    </TableCell>
                  )}
                  {/* Add empty cell for non-transfers to maintain table structure */}
                  {operations.some(op => op.type === "transfer") && operation.type !== "transfer" && (
                    <TableCell></TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 w-full">
        {operations.map((operation) => (
          <OperationsMobileCard 
            key={operation.id} 
            operation={operation}
            formatAmount={(amount) => `${Math.round(amount)}`}
            currency={currency}
            colorClass={getAmountColor(operation.type)}
            showType={true}
          />
        ))}
      </div>
    </>
  );
};
