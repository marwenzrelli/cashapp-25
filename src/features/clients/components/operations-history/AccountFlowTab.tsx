
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
import { useClients } from "@/features/clients/hooks/useClients";

interface AccountFlowTabProps {
  operations: Operation[];
  clientId: number;
  updateOperation?: (operation: Operation) => Promise<void>;
}

export const AccountFlowTab = ({ operations, updateOperation, clientId }: AccountFlowTabProps) => {
  const { currency } = useCurrency();
  const { clients } = useClients();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get current client balance from database
  const currentClient = clients?.find(c => c.id === clientId);
  const currentBalance = currentClient?.solde || 0;

  console.log(`AccountFlowTab - Client ${clientId} current balance from DB: ${currentBalance}`);

  // Sort operations chronologically from oldest to newest
  const sortedOperations = [...operations].sort((a, b) => {
    const dateA = new Date(a.operation_date || a.date);
    const dateB = new Date(b.operation_date || b.date);
    return dateA.getTime() - dateB.getTime();
  });

  console.log(`AccountFlowTab - Processing ${sortedOperations.length} operations chronologically`);

  // Calculate the balance changes for each operation
  const operationsWithBalanceChanges = sortedOperations.map((op, index) => {
    let balanceChange = 0;
    
    if (op.type === "deposit") {
      balanceChange = op.amount; // Deposit adds to balance
    } else if (op.type === "withdrawal") {
      balanceChange = -op.amount; // Withdrawal subtracts from balance
    } else if (op.type === "transfer") {
      // For transfers, we need to check if this client is sender or receiver
      // Since we don't have clear from_client_id/to_client_id for transfers,
      // we'll assume it's a withdrawal for this client
      balanceChange = -op.amount;
    } else if (op.type === "direct_transfer") {
      // For direct transfers, check if client is receiving or sending
      if (op.to_client_id === clientId) {
        balanceChange = op.amount; // Receiving transfer
      } else if (op.from_client_id === clientId) {
        balanceChange = -op.amount; // Sending transfer
      }
    }

    console.log(`AccountFlowTab - Operation ${op.id} (${index + 1}/${sortedOperations.length}):`, {
      type: op.type,
      amount: op.amount,
      clientId,
      to_client_id: op.to_client_id,
      from_client_id: op.from_client_id,
      balanceChange,
      date: op.operation_date || op.date
    });

    return {
      ...op,
      balanceChange
    };
  });

  // Calculate total change to find initial balance
  const totalChange = operationsWithBalanceChanges.reduce((sum, op) => sum + op.balanceChange, 0);
  const initialBalance = currentBalance - totalChange;

  console.log(`AccountFlowTab - Balance calculation:`, {
    currentBalance,
    totalChange,
    initialBalance
  });

  // Now calculate running balances chronologically
  const operationsWithBalances = operationsWithBalanceChanges.map((op, index) => {
    // Calculate balance before this operation
    const previousOperations = operationsWithBalanceChanges.slice(0, index);
    const balanceBefore = initialBalance + previousOperations.reduce((sum, prevOp) => sum + prevOp.balanceChange, 0);
    
    // Calculate balance after this operation
    const balanceAfter = balanceBefore + op.balanceChange;

    console.log(`AccountFlowTab - Operation ${op.id} balances:`, {
      balanceBefore,
      balanceChange: op.balanceChange,
      balanceAfter
    });

    return {
      ...op,
      balanceBefore,
      balanceAfter
    };
  });

  // Verify the final balance matches current balance
  const lastOperation = operationsWithBalances[operationsWithBalances.length - 1];
  const finalCalculatedBalance = lastOperation ? lastOperation.balanceAfter : initialBalance;
  
  console.log(`AccountFlowTab - Final verification:`, {
    initialBalance,
    finalCalculatedBalance,
    currentClientBalance: currentBalance,
    isBalanceMatching: Math.abs(finalCalculatedBalance - currentBalance) < 0.01
  });

  // Reverse for display (newest first)
  const displayOperations = [...operationsWithBalances].reverse();

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
      return `${isReceiving ? "+" : "-"} ${formatAmount(op.amount)} TND`;
    } else if (op.type === "withdrawal") {
      return `- ${formatAmount(op.amount)} TND`;
    } else {
      return `+ ${formatAmount(op.amount)} TND`;
    }
  };

  const getAmountClassForOperation = (op: any) => {
    if (op.balanceChange > 0) return "text-green-600 dark:text-green-400";
    if (op.balanceChange < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
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
