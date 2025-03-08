
import { cn } from "@/lib/utils";

interface DepositAmountProps {
  amount: number;
}

export const DepositAmount = ({ amount }: DepositAmountProps) => {
  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className={cn("font-medium tabular-nums", getAmountColor(amount))}>
      {amount.toLocaleString()} TND
    </div>
  );
};
