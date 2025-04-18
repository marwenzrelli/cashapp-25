
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";

interface DatePickerFieldProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
  label?: string;
  time?: string;
  onTimeChange?: (time: string) => void;
}

export const DatePickerField = ({
  date,
  onDateChange,
  label = "Date",
  time,
  onTimeChange
}: DatePickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const isMobile = useIsMobile();

  const handleTimeChange = (newTime: string) => {
    if (!onTimeChange) return;

    // On mobile, if user enters HH:MM and we need HH:MM:SS for backend
    // automatically append :00 seconds when mobile format is detected
    if (isMobile && newTime.split(':').length === 2) {
      onTimeChange(`${newTime}:00`);
    } else {
      onTimeChange(newTime);
    }
  };

  // Format time for display
  let displayTime = time;
  if (time && isMobile && time.split(':').length > 2) {
    // If on mobile and we have seconds, strip them for display
    const [hours, minutes] = time.split(':');
    displayTime = `${hours}:${minutes}`;
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "w-full justify-start text-left font-normal pl-10",
                  isMobile && "h-14 text-base"
                )}
              >
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                {date ? format(date, "dd/MM/yyyy", { locale: fr }) : <span>Choisir une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateChange}
                locale={fr}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {onTimeChange && (
          <div className="relative">
            <Input
              type="time"
              value={displayTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              step={isMobile ? "60" : "1"} // Minutes for mobile, seconds for desktop
              className={cn(
                "pl-10",
                isMobile && "h-14 text-base"
              )}
            />
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
  >
    {children}
  </label>
);
