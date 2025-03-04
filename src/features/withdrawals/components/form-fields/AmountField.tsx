
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BadgeDollarSign } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AmountFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export const AmountField: React.FC<AmountFieldProps> = ({
  value,
  onChange,
  id = "amount"
}) => {
  const { currency } = useCurrency();

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-normal">Montant</Label>
      <div className="relative">
        <BadgeDollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          id={id}
          type="number"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-12 text-base pr-16 transition-all focus-visible:ring-primary/50"
        />
        <span className="absolute right-3 top-3 text-muted-foreground font-medium">
          {currency}
        </span>
      </div>
    </div>
  );
};
