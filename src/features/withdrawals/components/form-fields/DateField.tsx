
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Clock } from "lucide-react";

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
  const [date, time] = value.includes('T') 
    ? value.split('T') 
    : [value, '00:00'];

  const handleDateChange = (newDate: string) => {
    const [currentDate] = value.includes('T') 
      ? value.split('T') 
      : [value, '00:00'];
    onChange(`${newDate}T${time}`);
  };

  const handleTimeChange = (newTime: string) => {
    onChange(`${date}T${newTime}`);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Date et heure du retrait</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id={id}
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="pl-9 transition-all focus-visible:ring-primary/50"
          />
        </div>
        <div className="relative">
          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id={`${id}-time`}
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="pl-9 transition-all focus-visible:ring-primary/50"
          />
        </div>
      </div>
    </div>
  );
};
