
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { DateRange } from "react-day-picker";
import { Search, Filter, Calendar, RefreshCw } from "lucide-react";
import { OperationsList } from "@/features/operations/components/OperationsList";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { operationMatchesSearch } from "@/features/operations/utils/display-helpers";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

const SearchOperations = () => {
  const { 
    operations: allOperations, 
    isLoading, 
    error,
    deleteOperation, 
    showDeleteDialog, 
    setShowDeleteDialog, 
    confirmDeleteOperation,
    operationToDelete,
    refreshOperations 
  } = useOperations();

  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setHasSearched(true);
    
    // Filter operations based on search criteria
    const results = allOperations.filter((op) => {
      // Match search term
      const matchesSearch = searchTerm ? operationMatchesSearch(op, searchTerm) : true;
      
      // Match operation type
      const matchesType = !type || op.type === type;
      
      // Match date range
      const matchesDate =
        (!dateRange?.from ||
          new Date(op.operation_date || op.date) >= new Date(dateRange.from)) &&
        (!dateRange?.to ||
          new Date(op.operation_date || op.date) <= new Date(dateRange.to));
      
      return matchesSearch && matchesType && matchesDate;
    });

    setTimeout(() => {
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setType(null);
    setDateRange(undefined);
    setSearchResults([]);
    setHasSearched(false);
  };

  // Reset search when new operations load
  useEffect(() => {
    if (hasSearched && searchTerm) {
      handleSearch();
    }
  }, [allOperations]);

  const handleTypeChange = (value: string) => {
    setType(value === "all" ? null : value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recherche d'opérations</h1>
        <p className="text-muted-foreground">
          Recherchez des opérations spécifiques dans le système
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Critères de recherche</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, description, ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={type || "all"} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-[180px] bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                <Filter className="h-4 w-4 mr-2 text-primary" />
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
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Période</span>
                    )}
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={clearSearch}>
              Effacer
            </Button>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <LoadingIndicator size="sm" text="Recherche..." /> : "Rechercher"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && !hasSearched && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center">
            <LoadingIndicator size="lg" text="Chargement des opérations..." />
          </div>
        </Card>
      )}

      {error && !hasSearched && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-red-500">
            <p>Erreur lors du chargement des opérations: {error}</p>
            <Button 
              onClick={() => refreshOperations(true)} 
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {hasSearched && (
        <>
          {isSearching ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center">
                <LoadingIndicator size="lg" text="Recherche en cours..." />
              </div>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Résultats de recherche</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">Aucune opération ne correspond à vos critères de recherche</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      <p className="text-sm text-muted-foreground mb-4">{searchResults.length} opération(s) trouvée(s)</p>
                      <OperationsList 
                        operations={searchResults} 
                        isLoading={false} 
                        onDelete={deleteOperation} 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      <DeleteOperationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={() => confirmDeleteOperation()}
        operation={operationToDelete}
      />
    </div>
  );
};

export default SearchOperations;
