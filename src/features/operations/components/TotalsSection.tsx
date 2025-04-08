
import { Operation } from "@/features/operations/types";
import { cn } from "@/lib/utils";

interface TotalsSectionProps {
  operations: Operation[];
  currency?: string;
}

export const TotalsSection = ({ operations, currency = "TND" }: TotalsSectionProps) => {
  // Format number with 2 decimal places and comma separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Calculate totals by operation type
  const totalDeposits = operations
    .filter(op => op.type === "deposit")
    .reduce((total, op) => total + op.amount, 0);
    
  const totalWithdrawals = operations
    .filter(op => op.type === "withdrawal")
    .reduce((total, op) => total + op.amount, 0);
    
  const totalTransfers = operations
    .filter(op => op.type === "transfer")
    .reduce((total, op) => total + op.amount, 0);
    
  // Calculate net movement (deposits - withdrawals)
  const netMovement = totalDeposits - totalWithdrawals;

  return (
    <div className="border-t px-4 py-3 bg-muted/20">
      <h3 className="font-medium mb-2">Totaux</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Versements:</span>
            <span className="font-medium text-green-600 dark:text-green-400">{formatNumber(totalDeposits)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Retraits:</span>
            <span className="font-medium text-red-600 dark:text-red-400">{formatNumber(totalWithdrawals)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Virements:</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">{formatNumber(totalTransfers)} {currency}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between pt-1 border-t">
            <span className="font-medium">Mouvement Net:</span>
            <span className={cn("font-bold", netMovement >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
              {formatNumber(netMovement)} {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
