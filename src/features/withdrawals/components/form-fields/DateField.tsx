
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
      // Create date object from the ISO string - will be converted to local time
      const date = new Date(value);
      
      // Format date as YYYY-MM-DD in local time
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateValue = `${year}-${month}-${day}`;
      
      // Format time as HH:MM:SS in local time
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      timeValue = `${hours}:${minutes}:${seconds}`;
      
      console.log("Parsed local date/time values:", { 
        original: value, 
        localDate: date.toString(),
        dateValue, 
        timeValue 
      });
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }
  
  const handleDateChange = (newDate: string) => {
    try {
      if (!newDate) return;
      
      // Get current date components from existing value
      const currentDate = new Date(value || new Date());
      
      // Parse the new date string
      const [year, month, day] = newDate.split('-').map(Number);
      
      // Create a new date object with the new date but current time
      const newDateObj = new Date(currentDate);
      newDateObj.setFullYear(year, month - 1, day);
      
      console.log("Date change:", {
        newDate,
        newDateObj: newDateObj.toString(),
        newISO: newDateObj.toISOString()
      });
      
      // Preserve the time from the current value
      onChange(newDateObj.toISOString());
    } catch (error) {
      console.error("Error handling date change:", error);
    }
  };

  const handleTimeChange = (newTime: string) => {
    try {
      if (!newTime) return;
      
      // Get current date components from existing value
      const currentDate = new Date(value || new Date());
      
      // Parse the time string
      const [hours, minutes, seconds = '0'] = newTime.split(':').map(Number);
      
      // Set the time components on the current date
      const newDateObj = new Date(currentDate);
      newDateObj.setHours(hours, minutes, parseInt(seconds as unknown as string));
      
      console.log("Time change:", {
        newTime,
        newDateObj: newDateObj.toString(),
        newISO: newDateObj.toISOString()
      });
      
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
