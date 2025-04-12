
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateTimeFieldProps {
  date: Date;
  setDate: (date: Date) => void;
  time: string;
  setTime: (time: string) => void;
}

export const DateTimeField = ({ date, setDate, time, setTime }: DateTimeFieldProps) => {
  const isMobile = useIsMobile();

  // Format time input based on device type
  let displayTime = time;
  
  // Ensure time format is appropriate for the device
  if (time && isMobile && time.split(':').length > 2) {
    // If on mobile and we have seconds, strip them
    const [hours, minutes] = time.split(':');
    displayTime = `${hours}:${minutes}`;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="date">Date et heure du versement</Label>
      <div className="grid grid-cols-1 gap-4">
        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline" 
                className={cn(
                  "w-full justify-start text-left font-normal relative pl-10",
                  isMobile && "h-14 text-lg"
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
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="relative">
          <Input
            id="time"
            type="time"
            step={isMobile ? "60" : "1"} // Minutes on mobile, seconds on desktop
            value={displayTime}
            onChange={(e) => setTime(e.target.value)}
            className={cn(
              "pl-10",
              isMobile && "h-14 text-lg"
            )}
            aria-label={`Heure ${isMobile ? 'format HH:MM' : 'format HH:MM:SS'}`}
          />
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
      </div>
    </div>
  );
};
