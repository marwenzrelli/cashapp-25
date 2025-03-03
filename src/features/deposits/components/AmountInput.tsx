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
  return <div className="space-y-2">
      <Label htmlFor="amount">Montant</Label>
      <Input id="amount" placeholder="Entrez le montant" type="number" value={amount} onChange={e => onAmountChange(e.target.value)} className="" />
    </div>;
};