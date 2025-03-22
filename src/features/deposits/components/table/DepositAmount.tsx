
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DepositAmountProps {
  amount: number;
}

export const DepositAmount = ({ amount }: DepositAmountProps) => {
  const { currency } = useCurrency();

  return (
    <div className="font-medium tabular-nums px-3 py-1 rounded-md text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
      {amount.toLocaleString()} {currency}
    </div>
  );
};
