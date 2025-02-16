
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Search, Check, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Operation, TIME_RANGES } from "../types";
import { getTypeIcon, getTypeLabel, getTypeStyle } from "../utils/operation-helpers";

interface OperationFiltersProps {
  selectedType: Operation["type"] | "all";
  searchTerm: string;
  date: { from: Date; to: Date };
  isCustomRange: boolean;
  onTypeSelect: (type: Operation["type"] | "all") => void;
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
  const handleDateRangeSelect = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    onDateChange({ from, to });
    onCustomRangeChange(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {(["all", "deposit", "withdrawal", "transfer"] as const).map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            onClick={() => onTypeSelect(type)}
            className={`gap-2 ${
              type === "all" ? "" : getTypeStyle(type as Operation["type"])
            }`}
          >
            {type === "all" ? (
              <Check className="h-4 w-4" />
            ) : (
              getTypeIcon(type as Operation["type"])
            )}
            {type === "all" ? "Tout" : getTypeLabel(type as Operation["type"])}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {isCustomRange
                  ? `${format(date.from, "d MMM", { locale: fr })} - ${format(date.to, "d MMM", { locale: fr })}`
                  : `${format(date.from, "d MMM", { locale: fr })} - ${format(date.to, "d MMM", { locale: fr })}`}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="grid gap-2 p-4">
              <div className="space-y-2">
                {TIME_RANGES.map((range) => (
                  <Button
                    key={range.days}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={() => handleDateRangeSelect(range.days)}
                  >
                    <Calendar className="h-4 w-4" />
                    {range.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => onCustomRangeChange(true)}
                >
                  <Calendar className="h-4 w-4" />
                  Plage personnalisée
                </Button>
              </div>
              {isCustomRange && (
                <div className="border-t pt-4 mt-2">
                  <div className="flex gap-2 mb-2 items-center justify-center text-sm text-muted-foreground">
                    <span>Du</span>
                    <span>{format(date.from || new Date(), "d MMM", { locale: fr })}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>au</span>
                    <span>{format(date.to || new Date(), "d MMM", { locale: fr })}</span>
                  </div>
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: date.from,
                      to: date.to,
                    }}
                    onSelect={(range) => {
                      if (range && range.from && range.to) {
                        onDateChange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                    locale={fr}
                  />
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
};
