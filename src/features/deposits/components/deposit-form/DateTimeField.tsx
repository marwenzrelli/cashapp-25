import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimeFieldProps {
  date: Date;
  setDate: (date: Date) => void;
  time: string;
  setTime: (time: string) => void;
}

export const DateTimeField = ({ date, setDate, time, setTime }: DateTimeFieldProps) => {
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
      <div className="grid grid-cols-1 gap-2">
        <div>
          <Input
            id="date"
            type="date"
            value={formatDateValue(date)}
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
