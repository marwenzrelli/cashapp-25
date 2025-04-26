import React from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { EmptyOperations } from "./EmptyOperations";
import { formatId } from "@/utils/formatId";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatNumber } from "./all-operations/OperationTypeHelpers";
import { useFormatAmount } from "@/hooks/use-format-amount";

interface DepositOperationsTabProps {
  operations: Operation[];
  currency?: string;
  selectedOperations?: Record<string, boolean>;
  toggleSelection?: (id: string) => void;
}
export const DepositOperationsTab = ({
  operations,
  currency = "TND",
  selectedOperations = {},
  toggleSelection = () => {}
}: DepositOperationsTabProps) => {
  const { formatAmount } = useFormatAmount();
  
  // Filter only deposit operations
  const depositOperations = operations.filter(operation => operation.type === "deposit");
  if (depositOperations.length === 0) {
    return <EmptyOperations />;
  }

  // Calculate total for deposits
  const totalDeposits = depositOperations.reduce((total, op) => total + op.amount, 0);

  return <>
      {/* Desktop version */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              
              <TableHead className="w-[10%] whitespace-nowrap font-medium">           ID</TableHead>
              <TableHead className="w-[15%] whitespace-nowrap font-medium">               Date</TableHead>
              
              <TableHead className="w-[30%] font-medium">                               Description</TableHead>
              <TableHead className="w-[15%] text-right whitespace-nowrap font-medium">Montant        </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {depositOperations.map(operation => {
            // Use operation_date if available, otherwise fall back to date
            const displayDate = operation.operation_date || operation.date;
            const formattedDate = typeof displayDate === 'string' ? format(new Date(displayDate), "dd/MM/yyyy HH:mm") : format(displayDate, "dd/MM/yyyy HH:mm");

            // Format operation ID
            const operationId = isNaN(parseInt(operation.id)) ? operation.id : formatId(parseInt(operation.id));

            // Check if operation is selected
            const isSelected = selectedOperations[operation.id] || false;
            return <TableRow key={operation.id} className={cn(isSelected ? "bg-green-50 dark:bg-green-900/20" : "", "transition-colors cursor-pointer hover:bg-muted/50")} onClick={() => toggleSelection(operation.id)}>
                  
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{operationId}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formattedDate}</TableCell>
                  
                  <TableCell className="max-w-[300px] truncate">{operation.description}</TableCell>
                  <TableCell className="text-right font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                    +{formatNumber(operation.amount)} {currency}
                  </TableCell>
                </TableRow>;
          })}
            
            {/* Totals section for desktop */}
            <TableRow className="border-t-2 border-primary/20 bg-muted/30">
              <TableCell colSpan={5} className="font-medium text-right">Total des versements:</TableCell>
              <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                +{formatNumber(totalDeposits)} {currency}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 w-full p-3">
        {depositOperations.map(operation => (
          <div 
            key={operation.id} 
            className={cn("transition-colors", selectedOperations[operation.id] ? "border-l-4 border-green-500 pl-2" : "")} 
            onClick={() => toggleSelection(operation.id)}
          >
            <div className="w-full">
              <OperationsMobileCard 
                key={operation.id} 
                operation={operation} 
                formatAmount={amount => `+ ${formatAmount(amount)}`} 
                currency={currency} 
                colorClass="text-green-600 dark:text-green-400" 
                showType={false} 
              />
            </div>
          </div>
        ))}
        
        <div className="mt-8 border-t-2 border-primary/20 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total des versements:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              +{formatAmount(totalDeposits)} {currency}
            </span>
          </div>
        </div>
      </div>
    </>;
};
