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

interface DatePickerFieldProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
}

export const DatePickerField = ({ date, onDateChange }: DatePickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleDateSelect = (newDate: Date | undefined) => {
    onDateChange(newDate);
    // Close the popover after selection on mobile
    setTimeout(() => setOpen(false), 300);
  };

  return (
    <div className="space-y-2">
      <Label>Date</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "P") : <span>Choisir une date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0"
          align="start"
          sideOffset={8}
        >
          <div 
            className="touch-manipulation" // Improve touch behavior
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
                day: "h-10 w-10 text-center p-0 focus-visible:bg-primary/20 hover:bg-primary/20 aria-selected:bg-primary", // Increase touch target size
                caption: "px-4 py-2 flex items-center justify-between",
                caption_label: "text-base font-medium", // Larger font
                nav_button: "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100", // Larger buttons
                table: "w-full border-collapse space-y-2", // More space 
                head_cell: "text-muted-foreground w-10 font-normal text-[0.9rem]", // Larger headers
                cell: "text-center text-sm p-0 relative h-10 w-10", // Larger cells
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
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    {children}
  </label>
);
