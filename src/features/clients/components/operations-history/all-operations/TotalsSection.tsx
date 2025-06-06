
import { Operation } from "@/features/operations/types";
import { cn } from "@/lib/utils";
import { useFormatAmount } from "@/hooks/use-format-amount";

interface TotalsSectionProps {
  operations: Operation[];
  currency: string;
  clientName?: string;
  isMobile?: boolean;
}

export const TotalsSection = ({ operations, currency, clientName, isMobile = false }: TotalsSectionProps) => {
  // Use our hook for proper number formatting
  const { formatAmount } = useFormatAmount();

  // Calculate totals by operation type
  const totalDeposits = operations
    .filter(op => op.type === "deposit")
    .reduce((total, op) => total + op.amount, 0);
    
  const totalWithdrawals = operations
    .filter(op => op.type === "withdrawal")
    .reduce((total, op) => total + op.amount, 0);
    
  // Separate transfers received and sent if clientName is provided
  const transfersReceived = clientName ? operations
    .filter(op => op.type === "transfer" && op.toClient === clientName)
    .reduce((total, op) => total + op.amount, 0) : 0;
    
  const transfersSent = clientName ? operations
    .filter(op => op.type === "transfer" && op.fromClient === clientName)
    .reduce((total, op) => total + op.amount, 0) : 0;
    
  // Total transfers (for backwards compatibility when clientName is not provided)
  const totalTransfers = !clientName ? operations
    .filter(op => op.type === "transfer")
    .reduce((total, op) => total + op.amount, 0) : 0;
    
  // Calculate net movement with new formula: deposits + transfers received - withdrawals - transfers sent
  const netMovement = clientName 
    ? totalDeposits + transfersReceived - totalWithdrawals - transfersSent
    : totalDeposits - totalWithdrawals;

  if (isMobile) {
    return (
      <div className="mt-6 p-4 border rounded-lg bg-muted/30">
        <h3 className="font-semibold mb-2 text-center">Récapitulatif</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Versements:</span>
            <span className="font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
              {formatAmount(totalDeposits)} {currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Retraits:</span>
            <span className="font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
              {formatAmount(totalWithdrawals)} {currency}
            </span>
          </div>
          {clientName ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm">Virements reçus:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                  {formatAmount(transfersReceived)} {currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Virements émis:</span>
                <span className="font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                  {formatAmount(transfersSent)} {currency}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm">Virements:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                {formatAmount(totalTransfers)} {currency}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t mt-2">
            <span className="font-medium">Solde Net:</span>
            <span className={cn(
              "font-bold px-2 py-0.5 rounded",
              netMovement >= 0 
                ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" 
                : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
            )}>
              {formatAmount(netMovement)} {currency}
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
        <span className="font-medium text-green-600 dark:text-green-400">{formatAmount(totalDeposits)} {currency}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">Retraits:</span>
        <span className="font-medium text-red-600 dark:text-red-400">{formatAmount(totalWithdrawals)} {currency}</span>
      </div>
      {clientName ? (
        <>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Virements reçus:</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">{formatAmount(transfersReceived)} {currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Virements émis:</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">{formatAmount(transfersSent)} {currency}</span>
          </div>
        </>
      ) : (
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Virements:</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">{formatAmount(totalTransfers)} {currency}</span>
        </div>
      )}
      <div className="flex justify-between pt-1 border-t">
        <span className="font-medium">Solde Net:</span>
        <span className={cn("font-bold", netMovement >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
          {formatAmount(netMovement)} {currency}
        </span>
      </div>
    </div>
  );
};
