
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";
import { EditFormData } from "@/components/deposits/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface EditDateTimeSectionProps {
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
}

export const EditDateTimeSection: React.FC<EditDateTimeSectionProps> = ({
  editForm,
  onEditFormChange
}) => {
  const isMobile = useIsMobile();
  
  // Format time for mobile display
  let displayTime = editForm.time || "";
  if (isMobile && displayTime.split(':').length > 2) {
    // Strip seconds on mobile
    const [hours, minutes] = displayTime.split(':');
    displayTime = `${hours}:${minutes}`;
  }
  
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
              isMobile && "h-14 text-base"
            )}
            value={editForm.date || ""}
            onChange={(e) => onEditFormChange('date', e.target.value)}
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
        <div className="relative">
          <Input
            id="depositTime"
            type="time"
            step={isMobile ? "60" : "1"} // Minutes on mobile, seconds on desktop
            className={cn(
              "pl-10 border rounded-lg bg-gray-50",
              isMobile && "h-14 text-base"
            )}
            value={displayTime}
            onChange={(e) => onEditFormChange('time', e.target.value)}
            aria-label={`Heure ${isMobile ? 'format HH:MM' : 'format HH:MM:SS'}`}
          />
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Cette date sera utilisée comme date d'opération personnalisée (heure locale).
        La date de création restera visible dans la liste des versements.
      </p>
    </div>
  );
};
