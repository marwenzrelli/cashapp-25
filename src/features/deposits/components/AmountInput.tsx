
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AmountInputProps {
  amount: string;
  onAmountChange: (value: string) => void;
}

export const AmountInput = ({
  amount,
  onAmountChange
}: AmountInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Montant</Label>
      <Input 
        id="amount" 
        placeholder="Entrez le montant" 
        type="number" 
        inputMode="numeric"
        pattern="[0-9]*"
        value={amount} 
        onChange={e => onAmountChange(e.target.value)} 
        className="text-lg py-6" 
      />
    </div>
  );
};
