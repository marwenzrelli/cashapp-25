
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
      <Label htmlFor="reason">Motif</Label>
      <Input
        id="reason"
        placeholder="Motif du virement"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};
