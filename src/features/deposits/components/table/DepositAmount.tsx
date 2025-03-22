
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DepositAmountProps {
  amount: number;
}

export const DepositAmount = ({ amount }: DepositAmountProps) => {
  const { currency } = useCurrency();

  return (
    <div className="font-medium tabular-nums px-3.5 py-1.5 rounded-md text-green-600 dark:text-green-400 bg-gradient-to-r from-gray-100/90 via-gray-50/80 to-gray-100/90 dark:from-gray-800/60 dark:via-green-900/30 dark:to-gray-800/60 shadow-sm border border-gray-300/50 dark:border-green-800/30 transition-all duration-200 hover:shadow-md hover:from-green-50/90 hover:via-green-100/80 hover:to-green-50/90 dark:hover:from-green-900/40 dark:hover:to-green-800/30">
      {amount.toLocaleString()} {currency}
    </div>
  );
};
