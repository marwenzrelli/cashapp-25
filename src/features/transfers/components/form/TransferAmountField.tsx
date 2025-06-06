
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/contexts/CurrencyContext";

interface TransferAmountFieldProps {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
}

export const TransferAmountField = ({ value, onChange }: TransferAmountFieldProps) => {
  const { currency } = useCurrency();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="amount" className="text-sm font-medium">
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
          className="pr-12"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-sm text-muted-foreground">{currency}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Saisissez le montant en {currency}
      </p>
    </div>
  );
};
