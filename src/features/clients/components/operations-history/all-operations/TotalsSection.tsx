
import { Operation } from "@/features/operations/types";
import { cn } from "@/lib/utils";

interface TotalsSectionProps {
  operations: Operation[];
  currency: string;
  isMobile?: boolean;
}

export const TotalsSection = ({ operations, currency, isMobile = false }: TotalsSectionProps) => {
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

  if (isMobile) {
    return (
      <div className="mt-6 p-4 border rounded-lg bg-muted/30">
        <h3 className="font-semibold mb-2 text-center">Récapitulatif</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Versements:</span>
            <span className="font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
              {formatNumber(totalDeposits)} {currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Retraits:</span>
            <span className="font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
              {formatNumber(totalWithdrawals)} {currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Virements:</span>
            <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
              {formatNumber(totalTransfers)} {currency}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t mt-2">
            <span className="font-medium">Mouvement Net:</span>
            <span className={cn(
              "font-bold px-2 py-0.5 rounded",
              netMovement >= 0 
                ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" 
                : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
            )}>
              {formatNumber(netMovement)} {currency}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
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
      <div className="flex justify-between pt-1 border-t">
        <span className="font-medium">Mouvement Net:</span>
        <span className={cn("font-bold", netMovement >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
          {formatNumber(netMovement)} {currency}
        </span>
      </div>
    </div>
  );
};
