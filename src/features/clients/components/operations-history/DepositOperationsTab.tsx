
import React from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { EmptyOperations } from "./EmptyOperations";
import { formatId } from "@/utils/formatId";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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
  // Filter only deposit operations
  const depositOperations = operations.filter(
    (operation) => operation.type === "deposit"
  );

  if (depositOperations.length === 0) {
    return <EmptyOperations />;
  }

  // Calculate total for deposits
  const totalDeposits = depositOperations.reduce((total, op) => total + op.amount, 0);

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
              <TableHead className="w-[50px]"></TableHead>
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
                
              // Check if operation is selected
              const isSelected = selectedOperations[operation.id] || false;
                
              return (
                <TableRow 
                  key={operation.id}
                  className={cn(
                    isSelected ? "bg-green-50 dark:bg-green-900/20" : "",
                    "transition-colors cursor-pointer"
                  )}
                  onClick={() => toggleSelection(operation.id)}
                >
                  <TableCell className="w-[50px] p-2">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(operation.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{operationId}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formattedDate}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{operation.fromClient}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{operation.description}</TableCell>
                  <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                    +{formatNumber(operation.amount)} {currency}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {/* Totals section for desktop */}
            <TableRow className="border-t-2 border-primary/20">
              <TableCell colSpan={5} className="font-medium">Total des versements:</TableCell>
              <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                +{formatNumber(totalDeposits)} {currency}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 w-full">
        {depositOperations.map((operation) => (
          <div 
            key={operation.id}
            className={cn(
              "transition-colors",
              selectedOperations[operation.id] ? "border-l-4 border-green-500 pl-2" : ""
            )}
            onClick={() => toggleSelection(operation.id)}
          >
            <div className="flex items-center mb-2">
              <Checkbox 
                checked={selectedOperations[operation.id] || false}
                onCheckedChange={() => toggleSelection(operation.id)}
                onClick={(e) => e.stopPropagation()}
                className="mr-2"
              />
              <div className="w-full">
                <OperationsMobileCard 
                  key={operation.id} 
                  operation={operation}
                  formatAmount={(amount) => `+${formatNumber(amount)}`}
                  currency={currency}
                  colorClass="text-green-600 dark:text-green-400"
                  showType={false}
                />
              </div>
            </div>
          </div>
        ))}
        
        {/* Totals section for mobile */}
        <div className="mt-8 border-t-2 border-primary/20 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total des versements:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              +{formatNumber(totalDeposits)} {currency}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
