
import { cn } from "@/lib/utils";

interface DepositAmountProps {
  amount: number;
}

export const DepositAmount = ({ amount }: DepositAmountProps) => {
  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
    if (amount < 0) return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40";
  };

  return (
    <div className={cn("font-medium tabular-nums px-3 py-1 rounded-md", getAmountColor(amount))}>
      {amount.toLocaleString()} TND
    </div>
  );
};
