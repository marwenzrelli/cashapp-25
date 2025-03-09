
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface DateTimeFieldProps {
  date: Date;
  setDate: (date: Date) => void;
  time: string;
  setTime: (time: string) => void;
}

export const DateTimeField = ({ date, setDate, time, setTime }: DateTimeFieldProps) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // Préserver l'heure actuelle lors du changement de date
      const newDate = new Date(e.target.value);
      const currentDate = new Date(date);
      
      newDate.setHours(
        currentDate.getHours(),
        currentDate.getMinutes(),
        currentDate.getSeconds()
      );
      
      console.log("DateTimeField: Date change", {
        input: e.target.value,
        current: date.toISOString(),
        newDate: newDate.toISOString()
      });
      
      setDate(newDate);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="date">Date et heure du versement</Label>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <Input
            id="date"
            type="date"
            value={format(date, "yyyy-MM-dd")}
            onChange={handleDateChange}
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
