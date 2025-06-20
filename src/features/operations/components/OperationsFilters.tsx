
import { useState } from "react";
import { Calendar, ListFilter, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ClientAutocomplete } from "./ClientAutocomplete";

interface OperationsFiltersProps {
  type: string | null;
  setType: (type: string | null) => void;
  client: string;
  setClient: (client: string) => void;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  isFiltering: boolean;
  onClearFilters: () => void;
  totalOperations: number;
  filteredCount: number;
}

export const OperationsFilters = ({
  type,
  setType,
  client,
  setClient,
  date,
  setDate,
  isFiltering,
  onClearFilters,
  totalOperations,
  filteredCount,
}: OperationsFiltersProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleTypeChange = (value: string) => {
    setType(value === "all" ? null : value);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (type) count++;
    if (client) count++;
    if (date?.from && date?.to) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Header with filter summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtrer les opérations</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {isFiltering && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer les filtres
          </Button>
        )}
      </div>

      {/* Results summary */}
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-sm text-muted-foreground">
          {isFiltering ? (
            <>
              <span className="font-medium text-primary">{filteredCount}</span> opération{filteredCount > 1 ? 's' : ''} trouvée{filteredCount > 1 ? 's' : ''} 
              <span className="mx-1">sur</span>
              <span className="font-medium">{totalOperations}</span> au total
            </>
          ) : (
            <>
              <span className="font-medium">{totalOperations}</span> opération{totalOperations > 1 ? 's' : ''} au total
            </>
          )}
        </p>
      </div>

      {/* Filter controls */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Search by client with autocomplete */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Rechercher un client</label>
          <ClientAutocomplete
            value={client}
            onChange={setClient}
            placeholder="Tapez le nom d'un client..."
          />
        </div>
        
        {/* Operation type filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Type d'opération</label>
          <Select value={type || "all"} onValueChange={handleTypeChange}>
            <SelectTrigger className="bg-background">
              <ListFilter className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les opérations</SelectItem>
              <SelectItem value="deposit">💰 Versements</SelectItem>
              <SelectItem value="withdrawal">💸 Retraits</SelectItem>
              <SelectItem value="transfer">🔄 Virements</SelectItem>
              <SelectItem value="direct_transfer">⚡ Opérations directes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date range filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Période</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-background",
                  !date && "text-muted-foreground"
                )}
              >
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
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {type && (
            <Badge variant="outline" className="bg-primary/5 border-primary/20">
              Type: {type === 'deposit' ? 'Versements' : type === 'withdrawal' ? 'Retraits' : type === 'transfer' ? 'Virements' : 'Opérations directes'}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => setType(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {client && (
            <Badge variant="outline" className="bg-primary/5 border-primary/20">
              Client: {client}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => setClient("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {date?.from && date?.to && (
            <Badge variant="outline" className="bg-primary/5 border-primary/20">
              Période: {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => setDate(undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
