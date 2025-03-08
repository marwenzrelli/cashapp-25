
import { useCurrency } from "@/contexts/CurrencyContext";

interface DepositAmountProps {
  amount: number;
}

export const DepositAmount = ({ amount }: DepositAmountProps) => {
  const { currency } = useCurrency();
  
  return (
    <div className="font-medium text-primary">
      {amount.toLocaleString()} {currency}
    </div>
  );
};
