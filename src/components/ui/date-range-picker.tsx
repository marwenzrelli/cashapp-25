
import * as React from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  className?: string;
}

export function DatePickerWithRange({
  date,
  onDateChange,
  className,
}: DatePickerWithRangeProps) {
  const [fromTime, setFromTime] = React.useState("00:00");
  const [toTime, setToTime] = React.useState("23:59");

  // Initialize times from existing dates
  React.useEffect(() => {
    if (date?.from) {
      setFromTime(format(date.from, "HH:mm"));
    }
    if (date?.to) {
      setToTime(format(date.to, "HH:mm"));
    }
  }, [date]);

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    if (!selectedDate) {
      onDateChange(undefined);
      return;
    }

    const updatedRange: DateRange = {
      from: undefined,
      to: undefined
    };

    if (selectedDate.from) {
      const [fromHours, fromMinutes] = fromTime.split(':').map(Number);
      const fromDate = new Date(selectedDate.from);
      fromDate.setHours(fromHours, fromMinutes, 0, 0);
      updatedRange.from = fromDate;
    }

    if (selectedDate.to) {
      const [toHours, toMinutes] = toTime.split(':').map(Number);
      const toDate = new Date(selectedDate.to);
      toDate.setHours(toHours, toMinutes, 59, 999);
      updatedRange.to = toDate;
    } else if (selectedDate.from && !selectedDate.to) {
      // If only from date is selected, set to same date with end time
      const [toHours, toMinutes] = toTime.split(':').map(Number);
      const toDate = new Date(selectedDate.from);
      toDate.setHours(toHours, toMinutes, 59, 999);
      updatedRange.to = toDate;
    }

    onDateChange(updatedRange);
  };

  const handleTimeChange = (timeType: 'from' | 'to', newTime: string) => {
    if (timeType === 'from') {
      setFromTime(newTime);
    } else {
      setToTime(newTime);
    }

    // Update the date range with new time
    if (date) {
      const updatedRange: DateRange = { ...date };

      if (timeType === 'from' && date.from) {
        const [hours, minutes] = newTime.split(':').map(Number);
        const newFromDate = new Date(date.from);
        newFromDate.setHours(hours, minutes, 0, 0);
        updatedRange.from = newFromDate;
      }

      if (timeType === 'to' && date.to) {
        const [hours, minutes] = newTime.split(':').map(Number);
        const newToDate = new Date(date.to);
        newToDate.setHours(hours, minutes, 59, 999);
        updatedRange.to = newToDate;
      }

      onDateChange(updatedRange);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal h-12",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy HH:mm", { locale: fr })} -{" "}
                  {format(date.to, "dd/MM/yyyy HH:mm", { locale: fr })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy HH:mm", { locale: fr })
              )
            ) : (
              <span>Sélectionner une plage de dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={1}
              locale={fr}
              className="pointer-events-auto"
            />
            
            {/* Time controls */}
            <div className="border-t pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Heure de début</Label>
                  <div className="relative">
                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={fromTime}
                      onChange={(e) => handleTimeChange('from', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Heure de fin</Label>
                  <div className="relative">
                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={toTime}
                      onChange={(e) => handleTimeChange('to', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
