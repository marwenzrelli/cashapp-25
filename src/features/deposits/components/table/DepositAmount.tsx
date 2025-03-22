
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DepositAmountProps {
  amount: number;
}

export const DepositAmount = ({ amount }: DepositAmountProps) => {
  const { currency } = useCurrency();

  return (
    <div className="font-medium tabular-nums px-3.5 py-1.5 rounded-md text-green-600 dark:text-green-400 bg-gradient-to-r from-green-50 to-green-100/70 dark:from-green-900/20 dark:to-green-800/10 shadow-sm border border-green-100/50 dark:border-green-800/30">
      {amount.toLocaleString()} {currency}
    </div>
  );
};
