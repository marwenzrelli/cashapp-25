
import { Wallet } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ClientBalanceDisplayProps {
  solde: number;
  clientId: number;
  clientName: string;
}

export const ClientBalanceDisplay = ({ solde, clientId, clientName }: ClientBalanceDisplayProps) => {
  const { currency } = useCurrency();
  
  // Use database balance directly (calculated server-side via triggers)
  const roundedBalance = Math.round(solde * 100) / 100; // Round to 2 decimal places
  
  // Use the formatAmount function for consistent currency formatting
  const formattedBalance = `${Math.abs(roundedBalance).toLocaleString('fr-FR', { 
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
