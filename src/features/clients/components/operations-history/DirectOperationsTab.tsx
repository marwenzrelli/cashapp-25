
import { Operation } from "@/features/operations/types";
import { OperationsDesktopTable } from "./all-operations/OperationsDesktopTable";
import { OperationsMobileList } from "./all-operations/OperationsMobileList";
import { TotalsSection } from "./all-operations/TotalsSection";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DirectOperationsTabProps {
  operations: Operation[];
  currency: string;
  isPublicView?: boolean;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
  clientName?: string; // Add clientName prop to identify the current client
}

export const DirectOperationsTab = ({ 
  operations, 
  currency,
  isPublicView = false,
  updateOperation,
  onOperationDeleted,
  clientName
}: DirectOperationsTabProps) => {
  
  // Filter and process direct operations with balance calculation
  const processedOperations = useMemo(() => {
    if (!clientName) return [];
    
    // Filter only direct operations
    const directOps = operations.filter(op => op.type === "direct_transfer");
    
    // Sort operations from oldest to newest for balance calculation
    const sortedOps = [...directOps].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date);
      const dateB = new Date(b.operation_date || b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Calculate running balance for each operation
    let runningBalance = 0;
    const opsWithBalance = sortedOps.map((op) => {
      const balanceBefore = runningBalance;

      // Update running balance based on operation direction
      if (op.toClient === clientName) {
        // Operation received - add amount
        runningBalance += op.amount;
      } else if (op.fromClient === clientName) {
        // Operation sent - subtract amount
        runningBalance -= op.amount;
      }
      
      return {
        ...op,
        balanceBefore,
        balanceAfter: runningBalance
      };
    });

    // Return sorted from newest to oldest for display
    return opsWithBalance.reverse();
  }, [operations, clientName]);

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  const getAmountClass = (operation: any) => {
    if (!clientName) return "text-blue-600";
    
    if (operation.toClient === clientName) {
      return "text-green-600"; // Received
    } else if (operation.fromClient === clientName) {
      return "text-red-600"; // Sent
    }
    return "text-blue-600";
  };

  const getAmountPrefix = (operation: any) => {
    if (!clientName) return "";
    
    if (operation.fromClient === clientName) {
      return "- "; // Sent operation
    }
    return ""; // Received operation
  };

  // If we have clientName, show the balance flow table
  if (clientName && processedOperations.length > 0) {
    return (
      <div className="space-y-4">
        <TotalsSection operations={operations.filter(op => op.type === "direct_transfer")} currency={currency} />
        
        <Card className="mt-4">
          {/* Mobile view - simplified */}
          <div className="md:hidden p-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {processedOperations.map((op: any) => (
                  <div key={op.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium">
                        {formatDateTime(op.operation_date || op.date)}
                      </div>
                      <Badge className={`${getTypeStyle(op.type)} flex items-center gap-1 text-xs`}>
                        {getTypeIcon(op.type)}
                        {getTypeLabel(op.type)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {op.description || "-"}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-gray-500">Solde avant</div>
                        <div>{formatAmount(op.balanceBefore)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Montant</div>
                        <div className={getAmountClass(op)}>
                          {getAmountPrefix(op)}{formatAmount(op.amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Solde après</div>
                        <div className="font-semibold">{formatAmount(op.balanceAfter)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Desktop view */}
          <div className="hidden md:block">
            <ScrollArea className="h-[600px] w-full rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[150px] text-right">Solde avant</TableHead>
                    <TableHead className="w-[120px] text-right">Montant</TableHead>
                    <TableHead className="w-[150px] text-right">Solde après</TableHead>
                    {!isPublicView && <TableHead className="w-[100px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedOperations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isPublicView ? 7 : 8} className="h-24 text-center">
                        Aucune opération directe trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedOperations.map((op: any) => (
                      <TableRow key={op.id}>
                        <TableCell className="font-medium">
                          {formatDateTime(op.operation_date || op.date)}
                        </TableCell>
                        <TableCell>{op.id.toString().split('-')[1] || op.id}</TableCell>
                        <TableCell>
                          <Badge className={`${getTypeStyle(op.type)} flex w-fit items-center gap-1`}>
                            {getTypeIcon(op.type)}
                            {getTypeLabel(op.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {op.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatAmount(op.balanceBefore)}
                        </TableCell>
                        <TableCell className={`text-right ${getAmountClass(op)}`}>
                          {getAmountPrefix(op)}{formatAmount(op.amount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(op.balanceAfter)}
                        </TableCell>
                        {!isPublicView && (
                          <TableCell>
                            {/* Actions column for non-public view */}
                            <div className="flex gap-1">
                              {/* Add action buttons here if needed */}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback to original components if no clientName or no operations
  return (
    <div className="space-y-4">
      <TotalsSection operations={operations} currency={currency} />
      <OperationsDesktopTable 
        operations={operations} 
        currency={currency}
        isPublicView={isPublicView}
        updateOperation={updateOperation}
        onOperationDeleted={onOperationDeleted}
      />
      <OperationsMobileList 
        operations={operations} 
        currency={currency}
        isPublicView={isPublicView}
        updateOperation={updateOperation}
        onOperationDeleted={onOperationDeleted}
      />
    </div>
  );
};
