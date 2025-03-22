
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DepositAmountProps {
  amount: number;
}

export const DepositAmount = ({ amount }: DepositAmountProps) => {
  const { currency } = useCurrency();

  return (
    <div className="font-medium tabular-nums px-3.5 py-1.5 rounded-md text-green-600 dark:text-green-400 bg-gradient-to-r from-green-50 to-green-100/70 dark:from-green-900/30 dark:to-green-800/20 shadow-sm border border-green-100/50 dark:border-green-800/30 transition-all duration-200 hover:shadow-md hover:from-green-100/80 hover:to-green-50/80 dark:hover:from-green-900/40 dark:hover:to-green-800/30">
      {amount.toLocaleString()} {currency}
    </div>
  );
};
