
import { Operation } from "@/features/operations/types";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { AccountFlowMobileView } from "./AccountFlowMobileView";

interface DirectOperationsTabProps {
  operations: Operation[];
  currency: string;
  isPublicView?: boolean;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
  client?: any; // Add client prop to access client name for balance calculation
}

export const DirectOperationsTab = ({ 
  operations, 
  currency,
  isPublicView = false,
  updateOperation,
  onOperationDeleted,
  client
}: DirectOperationsTabProps) => {

  // Sort operations by date and calculate running balance
  const processedOperations = useMemo(() => {
    if (!client || !operations.length) return [];
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    
    // Filter direct operations that concern this client
    const clientDirectOperations = operations.filter(op => {
      const isDirectReceived = op.type === "direct_transfer" && op.toClient === clientFullName;
      const isDirectSent = op.type === "direct_transfer" && op.fromClient === clientFullName;
      
      return isDirectReceived || isDirectSent;
    });
    
    // Sort operations from oldest to newest first
    const sortedOps = [...clientDirectOperations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date);
      const dateB = new Date(b.operation_date || b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Start with 0 and build up the balance
    let runningBalance = 0;
    const opsWithBalance = sortedOps.map((op) => {
      const balanceBefore = runningBalance;

      // Update running balance based on operation type and client relationship
      if (op.type === "direct_transfer") {
        if (op.toClient === clientFullName) {
          // Direct operation received
          runningBalance += op.amount;
        } else if (op.fromClient === clientFullName) {
          // Direct operation sent
          runningBalance -= op.amount;
        }
      }
      
      return {
        ...op,
        balanceBefore,
        balanceAfter: runningBalance
      };
    });

    // Return sorted from newest to oldest for display
    return opsWithBalance.reverse();
  }, [operations, client]);

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

  const getAmountClass = (type: string, clientFullName: string, operation: any) => {
    if (type === "direct_transfer") {
      if (operation.toClient === clientFullName) return "text-green-600"; // Received
      if (operation.fromClient === clientFullName) return "text-red-600"; // Sent
    }
    return "text-blue-600";
  };

  const getAmountPrefix = (type: string, clientFullName: string, operation: any) => {
    if (type === "direct_transfer" && operation.fromClient === clientFullName) return "- ";
    return "";
  };

  const clientFullName = client ? `${client.prenom} ${client.nom}`.trim() : '';

  return (
    <Card className="mt-4">
      {/* Mobile view */}
      <AccountFlowMobileView operations={processedOperations} isPublicView={isPublicView} />

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
                    <TableCell className={`text-right ${getAmountClass(op.type, clientFullName, op)}`}>
                      {getAmountPrefix(op.type, clientFullName, op)}{formatAmount(op.amount)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatAmount(op.balanceAfter)}
                    </TableCell>
                    {!isPublicView && (
                      <TableCell>
                        {/* Actions buttons for non-public view */}
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
  );
};
