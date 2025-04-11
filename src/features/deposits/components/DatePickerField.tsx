
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DatePickerFieldProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
  label?: string;
}

export const DatePickerField = ({ date, onDateChange, label = "Date" }: DatePickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();
  
  const handleDateSelect = (newDate: Date | undefined) => {
    onDateChange(newDate);
    // Close the popover immediately without animation
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              isMobile && "h-16 text-base py-4"
            )}
          >
            <CalendarIcon className={cn("mr-2", isMobile ? "h-6 w-6" : "h-5 w-5")} />
            {date ? format(date, "P") : <span>Choisir une date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0"
          align="start"
          sideOffset={8}
        >
          <div 
            className="touch-manipulation"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) =>
                date > new Date() || date < new Date("2023-01-01")
              }
              initialFocus
              classNames={{
                day: isMobile ? "h-14 w-14 text-center p-0 focus-visible:bg-primary/20 hover:bg-primary/20 aria-selected:bg-primary text-base" : "h-10 w-10 text-center p-0 focus-visible:bg-primary/20 hover:bg-primary/20 aria-selected:bg-primary",
                caption: "px-4 py-2 flex items-center justify-between",
                caption_label: isMobile ? "text-lg font-medium" : "text-base font-medium",
                nav_button: "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100",
                table: "w-full border-collapse space-y-2",
                head_cell: isMobile ? "text-muted-foreground w-14 font-normal text-[1rem]" : "text-muted-foreground w-10 font-normal text-[0.9rem]",
                cell: isMobile ? "text-center text-base p-0 relative h-14 w-14" : "text-center text-sm p-0 relative h-10 w-10",
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
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
