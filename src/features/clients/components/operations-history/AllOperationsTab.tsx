
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

  // Calculate totals for each operation type
  const calculateTotals = () => {
    const totals = {
      deposit: 0,
      withdrawal: 0,
      transfer: 0
    };

    operations.forEach(operation => {
      switch (operation.type) {
        case "deposit":
          totals.deposit += operation.amount;
          break;
        case "withdrawal":
          totals.withdrawal += operation.amount;
          break;
        case "transfer":
          totals.transfer += operation.amount;
          break;
      }
    });

    return totals;
  };

  const totals = calculateTotals();

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
                    {operation.type === "withdrawal" ? "-" : ""}{formatNumber(operation.amount)} {currency}
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
            
            {/* Totals section for desktop */}
            <TableRow className="border-t-2 border-primary/20">
              <TableCell colSpan={operations.some(op => op.type === "transfer") ? 4 : 3} className="font-medium">
                Totaux par type d'opération:
              </TableCell>
              <TableCell colSpan={operations.some(op => op.type === "transfer") ? 2 : 2}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}></TableCell>
              <TableCell colSpan={operations.some(op => op.type === "transfer") ? 2 : 1} className="font-medium">
                Dépôts:
              </TableCell>
              <TableCell className="text-center font-medium text-green-600 dark:text-green-400">
                +{formatNumber(totals.deposit)} {currency}
              </TableCell>
              {operations.some(op => op.type === "transfer") && <TableCell></TableCell>}
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}></TableCell>
              <TableCell colSpan={operations.some(op => op.type === "transfer") ? 2 : 1} className="font-medium">
                Retraits:
              </TableCell>
              <TableCell className="text-center font-medium text-red-600 dark:text-red-400">
                -{formatNumber(totals.withdrawal)} {currency}
              </TableCell>
              {operations.some(op => op.type === "transfer") && <TableCell></TableCell>}
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}></TableCell>
              <TableCell colSpan={operations.some(op => op.type === "transfer") ? 2 : 1} className="font-medium">
                Transferts:
              </TableCell>
              <TableCell className="text-center font-medium text-blue-600 dark:text-blue-400">
                {formatNumber(totals.transfer)} {currency}
              </TableCell>
              {operations.some(op => op.type === "transfer") && <TableCell></TableCell>}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 w-full">
        {operations.map((operation) => (
          <OperationsMobileCard 
            key={operation.id} 
            operation={operation}
            formatAmount={(amount) => `${formatNumber(amount)}`}
            currency={currency}
            colorClass={getAmountColor(operation.type)}
            showType={true}
          />
        ))}
        
        {/* Totals section for mobile */}
        <div className="mt-8 border-t-2 border-primary/20 pt-4">
          <h3 className="font-medium text-base mb-3">Totaux par type d'opération:</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Dépôts:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                +{formatNumber(totals.deposit)} {currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Retraits:</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{formatNumber(totals.withdrawal)} {currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Transferts:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formatNumber(totals.transfer)} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
