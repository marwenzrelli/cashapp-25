
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface DateTimeSectionProps {
  date: Date;
  setDate: (date: Date) => void;
  time: string;
  setTime: (time: string) => void;
}

export const DateTimeSection = ({
  date,
  setDate,
  time,
  setTime
}: DateTimeSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="date">Date et heure du versement</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <Input
            id="date"
            type="date"
            value={format(date, "yyyy-MM-dd")}
            onChange={(e) => {
              if (e.target.value) {
                setDate(new Date(e.target.value));
              }
            }}
            className="transition-all focus-visible:ring-primary/50"
          />
        </div>
        <div>
          <Input
            id="time"
            type="time"
            step="1" // Enable seconds selection
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="transition-all focus-visible:ring-primary/50"
          />
        </div>
      </div>
    </div>
  );
};
