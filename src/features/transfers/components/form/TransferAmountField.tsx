
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DollarSign } from "lucide-react";

interface TransferAmountFieldProps {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
}

export const TransferAmountField = ({ value, onChange }: TransferAmountFieldProps) => {
  const { currency } = useCurrency();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-green-600" />
        Montant à transférer
      </Label>
      <div className="relative">
        <Input
          id="amount"
          type="number"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="0"
          step="0.01"
          required
          className="pr-12 border-2 border-green-200 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50 dark:bg-green-950/30 dark:border-green-800"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
            {currency}
          </span>
        </div>
      </div>
      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
        💰 Saisissez le montant en {currency}
      </p>
    </div>
  );
};
