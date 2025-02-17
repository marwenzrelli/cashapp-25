
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OperationFiltersProps {
  selectedType: string;
  searchTerm: string;
  date: { from: Date; to: Date };
  isCustomRange: boolean;
  onTypeSelect: (type: string) => void;
  onSearch: (term: string) => void;
  onDateChange: (range: { from: Date; to: Date }) => void;
  onCustomRangeChange: (isCustom: boolean) => void;
}

export const OperationFilters = ({
  selectedType,
  searchTerm,
  date,
  isCustomRange,
  onTypeSelect,
  onSearch,
  onDateChange,
  onCustomRangeChange,
}: OperationFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <Input
            placeholder="Rechercher dans les opérations..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedType} onValueChange={onTypeSelect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type d'opération" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les opérations</SelectItem>
              <SelectItem value="deposit">Versements</SelectItem>
              <SelectItem value="withdrawal">Retraits</SelectItem>
              <SelectItem value="transfer">Virements</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yyyy", { locale: fr })} -{" "}
                    {format(date.to, "dd/MM/yyyy", { locale: fr })}
                  </>
                ) : (
                  format(date.from, "dd/MM/yyyy", { locale: fr })
                )
              ) : (
                <span>Sélectionner une période</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={{ from: date?.from, to: date?.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateChange({ from: range.from, to: range.to });
                  onCustomRangeChange(true);
                }
              }}
              numberOfMonths={2}
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
