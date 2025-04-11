
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
import { useEffect, useState } from "react";

interface DateTimeFieldProps {
  date: Date;
  setDate: (date: Date) => void;
  time: string;
  setTime: (time: string) => void;
}

export const DateTimeField = ({ date, setDate, time, setTime }: DateTimeFieldProps) => {
  const isMobile = useIsMobile();
  const [timeValue, setTimeValue] = useState(time);
  
  useEffect(() => {
    setTimeValue(time);
  }, [time]);
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    setTime(newTime);
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
                className={cn(
                  "w-full justify-start text-left font-normal relative pl-10",
                  isMobile && "h-16 text-lg"
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
                classNames={{
                  day: isMobile ? "h-14 w-14 text-center p-0 focus-visible:bg-primary/20 hover:bg-primary/20 aria-selected:bg-primary text-base" : "",
                  caption_label: isMobile ? "text-lg font-medium" : "",
                  head_cell: isMobile ? "text-muted-foreground w-14 font-normal text-[1rem]" : "",
                  cell: isMobile ? "text-center text-base p-0 relative h-14 w-14" : "",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="relative">
          <Input
            id="time"
            type="time"
            step="1" // Enable seconds selection
            value={timeValue}
            onChange={handleTimeChange}
            className={cn(
              "pl-10",
              isMobile && "h-16 text-lg"
            )}
          />
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        </div>
      </div>
    </div>
  );
};
