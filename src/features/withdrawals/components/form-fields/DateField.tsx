import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export const DateField: React.FC<DateFieldProps> = ({ 
  value, 
  onChange, 
  id = "date" 
}) => {
  // Extract date and time components from the ISO string
  const [date, time] = value.includes('T') 
    ? value.split('T') 
    : [value, ''];
  
  // Ensure we keep the exact hours, minutes and seconds
  const handleDateChange = (newDate: string) => {
    const currentTime = value.includes('T') 
      ? value.split('T')[1] 
      : new Date().toTimeString().split(' ')[0];
    onChange(`${newDate}T${currentTime}`);
  };

  const handleTimeChange = (newTime: string) => {
    onChange(`${date}T${newTime}`);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Date et heure du retrait</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <Input
            id={id}
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="transition-all focus-visible:ring-primary/50"
          />
        </div>
        <div>
          <Input
            id={`${id}-time`}
            type="time" 
            step="1" // This allows seconds to be entered
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="transition-all focus-visible:ring-primary/50"
          />
        </div>
      </div>
    </div>
  );
};
