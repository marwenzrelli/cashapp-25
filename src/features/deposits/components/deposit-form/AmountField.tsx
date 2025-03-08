
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeDollarSign } from "lucide-react";

interface AmountFieldProps {
  amount: string;
  setAmount: (amount: string) => void;
  currency: string;
}

export const AmountField = ({ amount, setAmount, currency }: AmountFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Montant</Label>
      <div className="relative">
        <BadgeDollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="pl-14 md:pl-9 transition-all focus-visible:ring-primary/50"
        />
        <span className="absolute right-3 top-3 text-muted-foreground">
          {currency}
        </span>
      </div>
    </div>
  );
};
