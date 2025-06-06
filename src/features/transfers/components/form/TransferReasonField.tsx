
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransferReasonFieldProps {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
}

export const TransferReasonField = ({ value, onChange }: TransferReasonFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="reason" className="text-sm font-medium">
        Motif du virement
      </Label>
      <Input
        id="reason"
        placeholder="Ex: Remboursement, Transfert familial..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="placeholder:text-muted-foreground/60"
      />
      <p className="text-xs text-muted-foreground">
        Précisez la raison du transfert
      </p>
    </div>
  );
};
