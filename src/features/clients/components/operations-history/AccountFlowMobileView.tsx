
import { useState } from "react";
import { Operation } from "@/features/operations/types";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { Badge } from "@/components/ui/badge";
import { EditOperationDialog } from "@/features/operations/components/EditOperationDialog";

interface AccountFlowMobileViewProps {
  operations: Operation[];
  updateOperation?: (operation: Operation) => Promise<void>;
}

export const AccountFlowMobileView = ({ operations, updateOperation }: AccountFlowMobileViewProps) => {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Sort and process operations similar to AccountFlowTab
  const sortedOperations = [...operations].sort((a, b) => {
    const dateA = new Date(a.operation_date || a.date);
    const dateB = new Date(b.operation_date || b.date);
    return dateB.getTime() - dateA.getTime();
  });

  const operationsWithBalance = sortedOperations.reverse().reduce((acc: any[], op, index, array) => {
    const amount = op.amount;
    const previousOp = index > 0 ? acc[index - 1] : null;
    let previousBalance = previousOp ? previousOp.balanceAfter : 0;
    
    let balanceChange = 0;
    if (op.type === "deposit") {
      balanceChange = amount;
    } else if (op.type === "withdrawal") {
      balanceChange = -amount;
    } else if (op.type === "transfer") {
      balanceChange = -amount;
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

  const getAmountClass = (type: string) => {
    if (type === "deposit") return "text-green-600";
    if (type === "withdrawal") return "text-red-600";
    if (type === "transfer") return "text-purple-600";
    return "";
  };

  const handleCardClick = (operation: Operation) => {
    if (updateOperation) {
      setSelectedOperation(operation);
      setIsEditDialogOpen(true);
    }
  };

  const handleOperationUpdate = async (updatedOperation: Operation) => {
    if (updateOperation) {
      await updateOperation(updatedOperation);
      setIsEditDialogOpen(false);
    }
  };

  if (displayOperations.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4 text-center">
          Aucune opération trouvée
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:hidden">
      {displayOperations.map((op) => (
        <Card 
          key={op.id} 
          className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleCardClick(op)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(op.operation_date || op.date)}
                </div>
                <div className="text-xs text-muted-foreground">
                  ID: {op.id.toString().split('-')[1] || op.id}
                </div>
              </div>
              <Badge className={`${getTypeStyle(op.type)} flex items-center gap-1`}>
                {getTypeIcon(op.type)}
                {getTypeLabel(op.type)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm mt-3">
              <div>
                <div className="text-xs text-muted-foreground">Solde avant</div>
                <div className="font-medium">{formatAmount(op.balanceBefore)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Montant</div>
                <div className={`font-semibold ${getAmountClass(op.type)}`}>
                  {op.type === "withdrawal" ? "- " : ""}{formatAmount(op.amount)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Solde après</div>
                <div className="font-bold">{formatAmount(op.balanceAfter)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {selectedOperation && (
        <EditOperationDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          operation={selectedOperation}
          onConfirm={handleOperationUpdate}
        />
      )}
    </div>
  );
};
