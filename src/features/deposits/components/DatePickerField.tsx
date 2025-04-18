import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
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
  const [timeValue, setTimeValue] = useState(time || "");
  const [showTimeInput, setShowTimeInput] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Synchronize internal state with external prop
  useEffect(() => {
    if (time !== undefined) {
      setTimeValue(time);
    }
  }, [time]);
  const handleDateSelect = (newDate: Date | undefined) => {
    onDateChange(newDate);
    // Close the popover immediately without animation
    setOpen(false);
  };
  const handleTimeChange = (newTime: string) => {
    if (!onTimeChange) return;

    // On mobile, if user enters HH:MM and we need HH:MM:SS for backend
    // automatically append :00 seconds when mobile format is detected
    if (isMobile && newTime.split(':').length === 2) {
      onTimeChange(`${newTime}:00`);
      setTimeValue(newTime); // Keep display time without seconds
    } else {
      onTimeChange(newTime);
      setTimeValue(newTime);
    }

    // Hide the time input after selection
    if (newTime) {
      setShowTimeInput(false);
    }
  };

  // Format time for display
  let displayTime = timeValue;
  if (timeValue && isMobile && timeValue.split(':').length > 2) {
    // If on mobile and we have seconds, strip them for display
    const [hours, minutes] = timeValue.split(':');
    displayTime = `${hours}:${minutes}`;
  }

  // Toggle time input visibility
  const toggleTimeInput = () => {
    setShowTimeInput(!showTimeInput);

    // Focus the input when shown
    if (!showTimeInput && timeInputRef.current) {
      setTimeout(() => {
        timeInputRef.current?.focus();
      }, 50);
    }
  };
  return <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button ref={buttonRef} variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", isMobile && "h-14 text-base py-4")}>
            <CalendarIcon className={cn("mr-2", isMobile ? "h-6 w-6" : "h-5 w-5")} />
            {date ? format(date, "P") : <span>Choisir une date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
          <div className="touch-manipulation" onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
            <Calendar mode="single" selected={date} onSelect={handleDateSelect} disabled={date => date > new Date() || date < new Date("2023-01-01")} initialFocus className="pointer-events-auto" classNames={{
            day: isMobile ? "h-14 w-14 text-center p-0 focus-visible:bg-primary/20 hover:bg-primary/20 aria-selected:bg-primary text-base" : "h-10 w-10 text-center p-0 focus-visible:bg-primary/20 hover:bg-primary/20 aria-selected:bg-primary",
            caption: "px-4 py-2 flex items-center justify-between",
            caption_label: isMobile ? "text-lg font-medium" : "text-base font-medium",
            nav_button: "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100",
            table: "w-full border-collapse space-y-2",
            head_cell: isMobile ? "text-muted-foreground w-14 font-normal text-[1rem]" : "text-muted-foreground w-10 font-normal text-[0.9rem]",
            cell: isMobile ? "text-center text-base p-0 relative h-14 w-14" : "text-center text-sm p-0 relative h-10 w-10"
          }} />
          </div>
        </PopoverContent>
      </Popover>
      
      {onTimeChange && <div className="mt-2">
          <Label>Heure</Label>
          <div className="relative mt-1">
            {/* Time button to toggle time input */}
            <Button variant="outline" type="button" className={cn("w-full pl-10 justify-start text-left font-normal", isMobile && "h-14 text-base py-4")} onClick={e => {
          e.preventDefault();
          toggleTimeInput();
        }}>
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              {displayTime || "Sélectionner l'heure"}
            </Button>
            
            {/* Direct input field for time, visible when toggled */}
            {showTimeInput && <div className="absolute inset-0 z-10 flex items-center">
                
              </div>}
          </div>
        </div>}
    </div>;
};
export const Label = ({
  children,
  htmlFor
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) => <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}>
    {children}
  </label>;