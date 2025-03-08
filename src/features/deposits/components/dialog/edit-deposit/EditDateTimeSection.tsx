
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";
import { EditFormData } from "@/features/deposits/types";

interface EditDateTimeSectionProps {
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
}

export const EditDateTimeSection: React.FC<EditDateTimeSectionProps> = ({
  editForm,
  onEditFormChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="depositDate" className="text-base font-medium">Date et heure d'opération</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Input
            id="depositDate"
            type="date"
            className="pl-10 border rounded-lg bg-gray-50"
            value={editForm.date || ""}
            onChange={(e) => onEditFormChange('date', e.target.value)}
          />
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        </div>
        <div className="relative">
          <Input
            id="depositTime"
            type="time"
            step="1"
            className="pl-10 border rounded-lg bg-gray-50"
            value={editForm.time || ""}
            onChange={(e) => onEditFormChange('time', e.target.value)}
          />
          <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Cette date sera utilisée comme date d'opération personnalisée (heure locale).
        La date de création restera visible dans la liste des versements.
      </p>
    </div>
  );
};
