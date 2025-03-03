
import { Wallet } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ClientBalanceDisplayProps {
  solde: number;
}

export const ClientBalanceDisplay = ({ solde }: ClientBalanceDisplayProps) => {
  const { currency } = useCurrency();
  
  return (
    <div className="flex items-center gap-1 pr-0 md:pr-6 md:border-r md:border-transparent">
      <Wallet className="h-4 w-4 text-muted-foreground" />
      <span className={`text-sm md:text-base font-medium ${solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {solde.toLocaleString()} {currency}
      </span>
    </div>
  );
};
