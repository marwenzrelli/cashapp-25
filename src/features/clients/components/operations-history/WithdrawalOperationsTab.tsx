import React from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { EmptyOperations } from "./EmptyOperations";
import { formatId } from "@/utils/formatId";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
interface WithdrawalOperationsTabProps {
  operations: Operation[];
  currency?: string;
  selectedOperations?: Record<string, boolean>;
  toggleSelection?: (id: string) => void;
}
export const WithdrawalOperationsTab = ({
  operations,
  currency = "TND",
  selectedOperations = {},
  toggleSelection = () => {}
}: WithdrawalOperationsTabProps) => {
  // Filter only withdrawal operations
  const withdrawalOperations = operations.filter(operation => operation.type === "withdrawal");
  if (withdrawalOperations.length === 0) {
    return <EmptyOperations />;
  }

  // Calculate total for withdrawals
  const totalWithdrawals = withdrawalOperations.reduce((total, op) => total + op.amount, 0);

  // Format number with 2 decimal places and comma separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  return <>
      {/* Desktop version */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[10%] whitespace-nowrap font-medium">          ID</TableHead>
              <TableHead className="w-[15%] whitespace-nowrap font-medium">               Date</TableHead>
              
              <TableHead className="w-[30%] font-medium">                                   Description</TableHead>
              <TableHead className="w-[15%] text-right whitespace-nowrap font-medium">Montant       </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawalOperations.map(operation => {
            // Use operation_date if available, otherwise fall back to date
            const displayDate = operation.operation_date || operation.date;
            const formattedDate = typeof displayDate === 'string' ? format(new Date(displayDate), "dd/MM/yyyy HH:mm") : format(displayDate, "dd/MM/yyyy HH:mm");

            // Format operation ID
            const operationId = isNaN(parseInt(operation.id)) ? operation.id : formatId(parseInt(operation.id));

            // Check if operation is selected
            const isSelected = selectedOperations[operation.id] || false;
            return <TableRow key={operation.id} className={cn(isSelected ? "bg-red-50 dark:bg-red-900/20" : "", "transition-colors cursor-pointer hover:bg-muted/50")} onClick={() => toggleSelection(operation.id)}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{operationId}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formattedDate}</TableCell>
                  
                  <TableCell className="max-w-[300px] truncate">{operation.description}</TableCell>
                  <TableCell className="text-right font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                    -{formatNumber(operation.amount)} {currency}
                  </TableCell>
                </TableRow>;
          })}
            
            {/* Totals section for desktop */}
            <TableRow className="border-t-2 border-primary/20 bg-muted/30">
              <TableCell colSpan={4} className="font-medium text-right">Total des retraits:</TableCell>
              <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                -{formatNumber(totalWithdrawals)} {currency}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 w-full p-3">
        {withdrawalOperations.map(operation => <div key={operation.id} className={cn("transition-colors", selectedOperations[operation.id] ? "border-l-4 border-red-500 pl-2" : "")} onClick={() => toggleSelection(operation.id)}>
            <div className="w-full">
              <OperationsMobileCard key={operation.id} operation={operation} formatAmount={amount => `-${formatNumber(amount)}`} currency={currency} colorClass="text-red-600 dark:text-red-400" showType={false} />
            </div>
          </div>)}
        
        {/* Totals section for mobile */}
        <div className="mt-8 border-t-2 border-primary/20 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total des retraits:</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{formatNumber(totalWithdrawals)} {currency}
            </span>
          </div>
        </div>
      </div>
    </>;
};