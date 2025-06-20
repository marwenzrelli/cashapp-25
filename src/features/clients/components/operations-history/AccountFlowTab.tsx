import { useState } from "react";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { EditOperationDialog } from "@/features/operations/components/EditOperationDialog";
import { AccountFlowMobileView } from "./AccountFlowMobileView";

interface AccountFlowTabProps {
  operations: Operation[];
  clientId: number;
  updateOperation?: (operation: Operation) => Promise<void>;
}

export const AccountFlowTab = ({ operations, updateOperation, clientId }: AccountFlowTabProps) => {
  const { currency } = useCurrency();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Sort operations by date from oldest to newest for calculation
  const sortedOperations = [...operations].sort((a, b) => {
    const dateA = new Date(a.operation_date || a.date);
    const dateB = new Date(b.operation_date || b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Calculate the current balance from all operations for this client
  const calculateCurrentBalance = () => {
    let balance = 0;
    
    sortedOperations.forEach(op => {
      if (op.type === "deposit") {
        balance += op.amount;
      } else if (op.type === "withdrawal") {
        balance -= op.amount;
      } else if (op.type === "transfer") {
        // For transfers, check if this client is receiving or sending
        if (op.to_client_id === clientId) {
          balance += op.amount; // Receiving transfer
        } else if (op.from_client_id === clientId) {
          balance -= op.amount; // Sending transfer
        }
      } else if (op.type === "direct_transfer") {
        // For direct transfers, check if this client is receiving or sending
        if (op.to_client_id === clientId) {
          balance += op.amount; // Receiving direct transfer
        } else if (op.from_client_id === clientId) {
          balance -= op.amount; // Sending direct transfer
        }
      }
    });
    
    return balance;
  };

  const currentBalance = calculateCurrentBalance();

  // Calculate running balance for each operation starting from the final balance and working backwards
  const operationsWithBalance = sortedOperations.reduceRight((acc: any[], op, index) => {
    const amount = op.amount;
    
    // Get the balance after this operation (from the next operation or current balance)
    const balanceAfter = acc.length > 0 ? acc[0].balanceBefore : currentBalance;
    
    // Calculate balance change based on operation type
    let balanceChange = 0;
    if (op.type === "deposit") {
      balanceChange = amount;
    } else if (op.type === "withdrawal") {
      balanceChange = -amount;
    } else if (op.type === "transfer") {
      // For transfers, check if this client is receiving or sending
      if (op.to_client_id === clientId) {
        balanceChange = amount; // Receiving transfer
      } else if (op.from_client_id === clientId) {
        balanceChange = -amount; // Sending transfer
      }
    } else if (op.type === "direct_transfer") {
      // For direct transfers, check if this client is receiving or sending
      if (op.to_client_id === clientId) {
        balanceChange = amount; // Receiving direct transfer
      } else if (op.from_client_id === clientId) {
        balanceChange = -amount; // Sending direct transfer
      }
    }
    
    const balanceBefore = balanceAfter - balanceChange;

    console.log(`AccountFlowTab - Operation ${op.id}:`, {
      type: op.type,
      amount: op.amount,
      clientId,
      to_client_id: op.to_client_id,
      from_client_id: op.from_client_id,
      balanceChange,
      balanceBefore,
      balanceAfter,
      isReceiving: op.to_client_id === clientId,
      isSending: op.from_client_id === clientId || (op.type === "withdrawal" || op.type === "deposit")
    });

    const operationWithBalance = {
      ...op,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      balanceChange: balanceChange
    };
    
    acc.unshift(operationWithBalance);
    return acc;
  }, []);

  // Display operations with newest first
  const displayOperations = [...operationsWithBalance].reverse();

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number): string => {
    return Math.abs(amount).toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    });
  };

  const getAmountClass = (type: string, amount: number) => {
    if (type === "deposit") return "text-green-600 dark:text-green-400";
    if (type === "withdrawal") return "text-red-600 dark:text-red-400";
    if (type === "transfer") return "text-blue-600 dark:text-blue-400";
    if (type === "direct_transfer") return "text-blue-600 dark:text-blue-400";
    return "";
  };

  const getBalanceClass = (balance: number) => {
    return balance >= 0 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";
  };

  const handleRowClick = (operation: Operation) => {
    if (updateOperation) {
      setSelectedOperation(operation);
      setIsEditDialogOpen(true);
    }
  };

  const handleOperationUpdate = async (updatedOperation: Operation): Promise<void> => {
    if (updateOperation) {
      await updateOperation(updatedOperation);
      setIsEditDialogOpen(false);
    }
  };

  const getAmountDisplay = (op: any) => {
    // For direct transfers and transfers, show + or - based on whether client receives or sends
    if (op.type === "direct_transfer" || op.type === "transfer") {
      const isReceiving = op.to_client_id === clientId;
      return `${isReceiving ? "" : "- "}${formatAmount(op.amount)} TND`;
    } else if (op.type === "withdrawal") {
      return `- ${formatAmount(op.amount)} TND`;
    } else {
      return `${formatAmount(op.amount)} TND`;
    }
  };

  const getAmountClassForOperation = (op: any) => {
    if (op.type === "deposit") return "text-green-600 dark:text-green-400";
    if (op.type === "withdrawal") return "text-red-600 dark:text-red-400";
    if (op.type === "direct_transfer" || op.type === "transfer") {
      const isReceiving = op.to_client_id === clientId;
      return isReceiving ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    }
    return "";
  };

  return (
    <>
      {/* Mobile view */}
      <AccountFlowMobileView 
        operations={displayOperations}
        clientId={clientId}
      />

      {/* Desktop view */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayOperations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucune opération trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  displayOperations.map((op) => (
                    <TableRow 
                      key={op.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(op)}
                    >
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
                      <TableCell className={`text-right ${getBalanceClass(op.balanceBefore)}`}>
                        {formatAmount(op.balanceBefore)} TND
                      </TableCell>
                      <TableCell className={`text-right ${getAmountClassForOperation(op)}`}>
                        {getAmountDisplay(op)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${getBalanceClass(op.balanceAfter)}`}>
                        {formatAmount(op.balanceAfter)} TND
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {selectedOperation && (
          <EditOperationDialog 
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            operation={selectedOperation}
            onConfirm={handleOperationUpdate}
          />
        )}
      </Card>
    </>
  );
};
