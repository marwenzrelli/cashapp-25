
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import { EditFormData } from "@/components/deposits/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface EditAmountSectionProps {
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
}

export const EditAmountSection: React.FC<EditAmountSectionProps> = ({
  editForm,
  onEditFormChange
}) => {
  const { currency } = useCurrency();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="edit-amount" className="text-base font-medium">Montant</Label>
      <div className="relative">
        <Input
          id="edit-amount"
          type="number"
          placeholder="0.00"
          value={editForm.amount}
          onChange={(e) => onEditFormChange('amount', e.target.value)}
          className="pl-10 border rounded-lg bg-gray-50 text-green-600 font-bold"
        />
        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-green-500" />
        <div className="absolute right-3 top-3 text-green-600 font-medium">{currency}</div>
      </div>
    </div>
  );
};
