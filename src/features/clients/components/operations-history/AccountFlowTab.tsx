
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

  // Sort operations by date from newest to oldest
  const sortedOperations = [...operations].sort((a, b) => {
    const dateA = new Date(a.operation_date || a.date);
    const dateB = new Date(b.operation_date || b.date);
    return dateB.getTime() - dateA.getTime();
  });

  // Calculate running balance for each operation
  const operationsWithBalance = sortedOperations.reverse().reduce((acc: any[], op, index, array) => {
    // Start with the oldest operations (we reversed the array)
    const amount = op.amount;
    const previousOp = index > 0 ? acc[index - 1] : null;
    let previousBalance = previousOp ? previousOp.balanceAfter : 0;
    
    // For withdrawals, we subtract from the balance
    // For deposits, we add to the balance
    // For transfers, it depends on if the client is sending or receiving
    let balanceChange = 0;
    if (op.type === "deposit") {
      balanceChange = amount;
    } else if (op.type === "withdrawal") {
      balanceChange = -amount;
    } else if (op.type === "transfer") {
      // If this client is the sender, it's negative; if receiver, it's positive
      // This is a simplified approach, might need adjustment based on your data structure
      balanceChange = -amount; // Assuming current view is for the sender
    }
    
    const balanceAfter = previousBalance + balanceChange;

    acc.push({
      ...op,
      balanceBefore: previousBalance,
      balanceAfter: balanceAfter,
      balanceChange: balanceChange
    });
    
    return acc;
  }, []);

  // Reverse back to show newest first
  const displayOperations = [...operationsWithBalance].reverse();

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

  const getAmountClass = (type: string, amount: number) => {
    if (type === "deposit") return "text-green-600";
    if (type === "withdrawal") return "text-red-600";
    if (type === "transfer") return "text-purple-600";
    return "";
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

  return (
    <>
      {/* Mobile view */}
      <AccountFlowMobileView 
        operations={displayOperations}
        updateOperation={updateOperation}
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
                      <TableCell className="text-right">
                        {formatAmount(op.balanceBefore)}
                      </TableCell>
                      <TableCell className={`text-right ${getAmountClass(op.type, op.amount)}`}>
                        {op.type === "withdrawal" ? "- " : ""}{formatAmount(op.amount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatAmount(op.balanceAfter)}
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
