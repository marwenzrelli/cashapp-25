
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();
  
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
      
      // Format time in 24-hour format for both mobile and desktop
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      timeValue = `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error parsing date:", error);
    }
  }
  
  const handleDateChange = (newDate: Date | undefined) => {
    try {
      if (!newDate) return;
      
      // Get current date components from existing value
      const currentDate = new Date(value || new Date());
      
      // Create a new date object with the new date but current time
      const newDateObj = new Date(currentDate);
      newDateObj.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      
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
      const timeParts = newTime.split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      // Set the time components on the current date
      const newDateObj = new Date(currentDate);
      newDateObj.setHours(hours, minutes, 0); // Always set seconds to 0
      
      onChange(newDateObj.toISOString());
    } catch (error) {
      console.error("Error handling time change:", error);
    }
  };

  // Create a Date object from the ISO string
  const dateObj = value ? new Date(value) : new Date();

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base">Date et heure du retrait</Label>
      <div className="grid grid-cols-1 gap-4">
        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={id}
                variant="outline" 
                className={cn(
                  "w-full justify-start text-left font-normal relative pl-10",
                  isMobile && "h-14 text-lg"
                )}
              >
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                {format(dateObj, "dd/MM/yyyy", { locale: fr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateObj}
                onSelect={handleDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="relative">
          <Input
            id={`${id}-time`}
            type="time" 
            step="60"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className={cn(
              "pl-10",
              isMobile && "h-14 text-lg"
            )}
            aria-label="Heure au format HH:MM (24h)"
          />
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

