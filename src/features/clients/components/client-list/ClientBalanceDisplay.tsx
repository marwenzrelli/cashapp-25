
import { Wallet } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { useMemo } from "react";

interface ClientBalanceDisplayProps {
  solde: number;
  clientId: number;
  clientName: string;
}

export const ClientBalanceDisplay = ({ solde, clientId, clientName }: ClientBalanceDisplayProps) => {
  const { currency } = useCurrency();
  const { operations } = useOperations();
  
  // Calculate net balance from operations
  const netBalance = useMemo(() => {
    if (!operations || operations.length === 0) {
      return solde; // Fallback to database balance
    }

    const clientFullName = clientName.trim();
    
    // Calculate totals by operation type
    const totalDeposits = operations
      .filter(op => op.type === "deposit" && (op.client_id === clientId || op.fromClient === clientFullName))
      .reduce((total, op) => total + op.amount, 0);
      
    const totalWithdrawals = operations
      .filter(op => op.type === "withdrawal" && (op.client_id === clientId || op.fromClient === clientFullName))
      .reduce((total, op) => total + op.amount, 0);
      
    // Separate transfers received and sent
    const transfersReceived = operations
      .filter(op => op.type === "transfer" && (op.to_client_id === clientId || op.toClient === clientFullName))
      .reduce((total, op) => total + op.amount, 0);
      
    const transfersSent = operations
      .filter(op => op.type === "transfer" && (op.from_client_id === clientId || op.fromClient === clientFullName))
      .reduce((total, op) => total + op.amount, 0);

    // Calculate direct operations received and sent
    const directOperationsReceived = operations
      .filter(op => op.type === "direct_transfer" && (op.to_client_id === clientId || op.toClient === clientFullName))
      .reduce((total, op) => total + op.amount, 0);
      
    const directOperationsSent = operations
      .filter(op => op.type === "direct_transfer" && (op.from_client_id === clientId || op.fromClient === clientFullName))
      .reduce((total, op) => total + op.amount, 0);
      
    // Calculate net balance: deposits + transfers received + direct operations received - withdrawals - transfers sent - direct operations sent
    return totalDeposits + transfersReceived + directOperationsReceived - totalWithdrawals - transfersSent - directOperationsSent;
  }, [operations, clientId, clientName, solde]);
  
  // Format the balance with explicit sign and proper rounding
  const roundedBalance = Math.round(netBalance * 100) / 100; // Round to 2 decimal places
  const sign = roundedBalance >= 0 ? "+ " : ""; // Negative sign is automatically included
  
  // Use the formatAmount function for consistent currency formatting
  const formattedBalance = `${sign}${Math.abs(roundedBalance).toLocaleString('fr-FR', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  })} ${currency}`;
  
  return (
    <div className="flex flex-col gap-1 pr-0 md:pr-6 md:border-r md:border-transparent">
      <div className="flex items-center">
        <Wallet className="h-4 w-4 text-muted-foreground mr-1" />
        <span className="text-sm text-muted-foreground">Solde net</span>
      </div>
      <div className="mt-1">
        <span className={`text-sm md:text-base font-medium px-2 py-1 border rounded-md ${
          roundedBalance >= 0 
            ? 'text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-400' 
            : 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400'
        }`}>
          {formattedBalance}
        </span>
      </div>
    </div>
  );
};
