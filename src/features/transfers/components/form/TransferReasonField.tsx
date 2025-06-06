
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface TransferReasonFieldProps {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
}

export const TransferReasonField = ({ value, onChange }: TransferReasonFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="reason" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-600" />
        Motif du virement
      </Label>
      <Input
        id="reason"
        placeholder="Ex: Remboursement, Transfert familial..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-800 placeholder:text-blue-400 dark:placeholder:text-blue-500"
      />
      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
        📝 Précisez la raison du transfert
      </p>
    </div>
  );
};
