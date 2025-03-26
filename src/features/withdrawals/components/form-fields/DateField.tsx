
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
  let dateValue = '';
  let timeValue = '';
  
  if (value) {
    try {
      const date = new Date(value);
      
      // Format date as YYYY-MM-DD
      dateValue = date.toISOString().split('T')[0];
      
      // Format time as HH:MM:SS
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      timeValue = `${hours}:${minutes}:${seconds}`;
      
      console.log("Parsed date/time values:", { original: value, dateValue, timeValue });
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }
  
  const handleDateChange = (newDate: string) => {
    try {
      // Create date object from the date input
      const dateParts = newDate.split('-').map(Number);
      const newDateObj = new Date();
      newDateObj.setFullYear(dateParts[0], dateParts[1] - 1, dateParts[2]);
      
      // Extract time parts from existing value
      const currentTime = timeValue.split(':').map(Number);
      if (currentTime.length >= 2) {
        newDateObj.setHours(currentTime[0], currentTime[1], currentTime[2] || 0);
      }
      
      onChange(newDateObj.toISOString());
    } catch (error) {
      console.error("Error handling date change:", error);
    }
  };

  const handleTimeChange = (newTime: string) => {
    try {
      // Create date object from the current date value
      const dateParts = dateValue.split('-').map(Number);
      const newDateObj = new Date();
      newDateObj.setFullYear(dateParts[0], dateParts[1] - 1, dateParts[2]);
      
      // Set time parts
      const timeParts = newTime.split(':').map(Number);
      if (timeParts.length >= 2) {
        newDateObj.setHours(timeParts[0], timeParts[1], timeParts[2] || 0);
      }
      
      onChange(newDateObj.toISOString());
    } catch (error) {
      console.error("Error handling time change:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Date et heure du retrait</Label>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <Input
            id={id}
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            className="transition-all focus-visible:ring-primary/50"
          />
        </div>
        <div>
          <Input
            id={`${id}-time`}
            type="time" 
            step="1" // This allows seconds to be entered
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="transition-all focus-visible:ring-primary/50"
          />
        </div>
      </div>
    </div>
  );
};
