
import React from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OperationsMobileCard } from "./OperationsMobileCard";
import { EmptyOperations } from "./EmptyOperations";
import { cn } from "@/lib/utils";
import { formatId } from "@/utils/formatId";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

interface AllOperationsTabProps {
  operations: Operation[];
  currency?: string;
  selectedOperations?: Record<string, boolean>;
  toggleSelection?: (id: string) => void;
}

export const AllOperationsTab = ({ 
  operations, 
  currency = "TND",
  selectedOperations = {},
  toggleSelection = () => {}
}: AllOperationsTabProps) => {
  if (operations.length === 0) {
    return <EmptyOperations />;
  }

  // Format number with 2 decimal places and comma separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Determine color based on operation type
  const getOperationTypeColor = (type: string): string => {
    switch (type) {
      case "deposit":
        return "text-green-600 dark:text-green-400";
      case "withdrawal":
        return "text-red-600 dark:text-red-400";
      case "transfer":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Type</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Client</TableHead>
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
                
              // Check if operation is selected
              const isSelected = selectedOperations[operation.id] || false;
                
              return (
                <TableRow 
                  key={operation.id} 
                  className={cn(
                    isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "",
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
                  <TableCell className="whitespace-nowrap capitalize">
                    {operation.type === "deposit" && "Versement"}
                    {operation.type === "withdrawal" && "Retrait"}
                    {operation.type === "transfer" && "Virement"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{operationId}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formattedDate}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                  <TableCell className={cn("text-right font-medium whitespace-nowrap", getOperationTypeColor(operation.type))}>
                    {operation.type === "withdrawal" ? "-" : 
                     operation.type === "deposit" ? "+" : ""}{formatNumber(operation.amount)} {currency}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {operation.type === "transfer" ? (
                      <div className="flex flex-col">
                        <span className="text-sm">De: {operation.fromClient}</span>
                        <span className="text-sm">À: {operation.toClient}</span>
                      </div>
                    ) : (
                      operation.fromClient
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 w-full">
        {operations.map((operation) => (
          <div 
            key={operation.id}
            className={cn(
              "transition-colors",
              selectedOperations[operation.id] ? "border-l-4 border-blue-500 pl-2" : ""
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
                  operation={operation}
                  formatAmount={(amount) => {
                    const prefix = operation.type === "withdrawal" ? "-" : 
                               operation.type === "deposit" ? "+" : "";
                    return `${prefix}${formatNumber(amount)}`;
                  }}
                  currency={currency}
                  colorClass={getOperationTypeColor(operation.type)}
                  showType={true}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
