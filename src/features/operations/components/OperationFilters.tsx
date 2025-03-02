
import { useState } from "react";
import { Search, Calendar, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Operation } from "../types";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface OperationFiltersProps {
  type: string | null;
  setType: (type: string | null) => void;
  client: string;
  setClient: (client: string) => void;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export const OperationFilters = ({
  type,
  setType,
  client,
  setClient,
  date,
  setDate,
}: OperationFiltersProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleTypeChange = (value: string) => {
    setType(value === "all" ? null : value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par ID, nom de client, ou plusieurs IDs séparés par virgule..."
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Select value={type || "all"} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px] bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
          <ListFilter className="h-4 w-4 mr-2 text-primary" />
          <SelectValue placeholder="Type d'opération" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les opérations</SelectItem>
          <SelectItem value="deposit">Versements</SelectItem>
          <SelectItem value="withdrawal">Retraits</SelectItem>
          <SelectItem value="transfer">Virements</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[260px] flex justify-between items-center bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors",
              !date && "text-muted-foreground"
            )}
          >
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(date.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Sélectionner une période</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
