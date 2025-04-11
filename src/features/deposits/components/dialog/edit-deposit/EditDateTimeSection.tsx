
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";
import { EditFormData } from "@/components/deposits/types";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditDateTimeSectionProps {
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
}

export const EditDateTimeSection: React.FC<EditDateTimeSectionProps> = ({
  editForm,
  onEditFormChange
}) => {
  const isMobile = useIsMobile();
  const [timeValue, setTimeValue] = useState(editForm.time || "");
  
  useEffect(() => {
    setTimeValue(editForm.time || "");
  }, [editForm.time]);
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    onEditFormChange('time', newTime);
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="depositDate" className="text-base font-medium">Date et heure d'opération</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Input
            id="depositDate"
            type="date"
            className={cn(
              "pl-10 border rounded-lg bg-gray-50",
              isMobile && "h-16 text-lg"
            )}
            value={editForm.date || ""}
            onChange={(e) => onEditFormChange('date', e.target.value)}
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
        <div className="relative">
          <Input
            id="depositTime"
            type="time"
            step="1"
            className={cn(
              "pl-10 border rounded-lg bg-gray-50",
              isMobile && "h-16 text-lg"
            )}
            value={timeValue}
            onChange={handleTimeChange}
          />
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Cette date sera utilisée comme date d'opération personnalisée (heure locale).
        La date de création restera visible dans la liste des versements.
      </p>
    </div>
  );
};
