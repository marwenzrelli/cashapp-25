
import { Wallet } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ClientBalanceDisplayProps {
  solde: number;
}

export const ClientBalanceDisplay = ({ solde }: ClientBalanceDisplayProps) => {
  const { currency } = useCurrency();
  
  return (
    <div className="flex flex-col gap-1 pr-0 md:pr-6 md:border-r md:border-transparent">
      <div className="flex items-center">
        <Wallet className="h-4 w-4 text-muted-foreground mr-1" />
        <span className="text-sm text-muted-foreground">Solde</span>
      </div>
      <div className="mt-1">
        <span className={`text-sm md:text-base font-medium text-left px-2 py-1 border border-gray-200 rounded-md ${solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {solde.toLocaleString()} {currency}
        </span>
      </div>
    </div>
  );
};
