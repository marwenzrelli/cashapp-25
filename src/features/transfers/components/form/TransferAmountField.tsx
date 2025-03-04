
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransferAmountFieldProps {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
}

export const TransferAmountField = ({ value, onChange }: TransferAmountFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Montant</Label>
      <Input
        id="amount"
        type="number"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min="0"
        step="0.01"
        required
      />
    </div>
  );
};
