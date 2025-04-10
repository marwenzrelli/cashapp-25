
import { Input } from "@/components/ui/input";
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

interface DateTimeFieldProps {
  date: Date;
  setDate: (date: Date) => void;
  time: string;
  setTime: (time: string) => void;
}

export const DateTimeField = ({ date, setDate, time, setTime }: DateTimeFieldProps) => {
  const isMobile = useIsMobile();
  
  // Format date as YYYY-MM-DD in local time
  const formatDateValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      try {
        // Create a new date object based on the selected date but keep current time
        const [year, month, day] = e.target.value.split('-').map(Number);
        const newDate = new Date(date);
        newDate.setFullYear(year, month - 1, day);
        
        console.log("Date change:", {
          input: e.target.value,
          newDate: newDate.toString()
        });
        
        setDate(newDate);
      } catch (error) {
        console.error("Error parsing date input:", error);
      }
    }
  };

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
                className={`w-full justify-start text-left font-normal relative pl-10 ${isMobile ? "h-14 text-lg" : ""}`}
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
            step="1" // Enable seconds selection
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`pl-10 ${isMobile ? "h-14 text-lg" : ""}`}
          />
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
      </div>
    </div>
  );
};
