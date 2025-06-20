
import React from "react";
import { Operation } from "@/features/operations/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { RefreshCw, Search, XCircle, Calendar, Check, Play } from "lucide-react";
import { ClientOperationsHistoryTabs } from "./operations-history/ClientOperationsHistoryTabs";
import { Switch } from "@/components/ui/switch";

interface ClientOperationsHistoryProps {
  operations: Operation[];
  selectedType: "all" | "deposit" | "withdrawal" | "transfer";
  setSelectedType: (type: "all" | "deposit" | "withdrawal" | "transfer") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  isCustomRange: boolean;
  setIsCustomRange: (isCustom: boolean) => void;
  filteredOperations: Operation[];
  refreshOperations: () => Promise<void>;
  showAllDates?: boolean;
  setShowAllDates?: (showAll: boolean) => void;
  clientId?: number;
  isPepsiMen?: boolean;
  clientName?: string;
  updateOperation?: (operation: Operation) => Promise<void>;
}

export const ClientOperationsHistory: React.FC<ClientOperationsHistoryProps> = ({
  operations,
  selectedType,
  setSelectedType,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  isCustomRange,
  setIsCustomRange,
  filteredOperations,
  refreshOperations,
  showAllDates = false,
  setShowAllDates = () => {},
  clientId,
  isPepsiMen = false,
  clientName,
  updateOperation
}) => {
  // State for pending date range before confirmation
  const [pendingDateRange, setPendingDateRange] = React.useState<DateRange | undefined>(dateRange);
  // State to control if operations should be displayed
  const [showOperations, setShowOperations] = React.useState(false);

  // Log operations data for pepsi men for debugging
  React.useEffect(() => {
    if (isPepsiMen) {
      console.log(`ClientOperationsHistory - Total operations for client ID ${clientId}: ${operations.length}`);
      console.log(`ClientOperationsHistory - Filtered operations: ${filteredOperations.length}`);
      const withdrawals = operations.filter(op => op.type === "withdrawal");
      console.log(`ClientOperationsHistory - Total withdrawals: ${withdrawals.length}`);
      console.log(`Withdrawal IDs: ${withdrawals.map(w => w.id).join(', ')}`);
    }
    
    // Debug date range filtering
    if (dateRange?.from && dateRange?.to && !showAllDates) {
      console.log(`ClientOperationsHistory - Date range: ${dateRange.from.toISOString()} to ${dateRange.to.toISOString()}`);
      console.log(`ClientOperationsHistory - ShowAllDates: ${showAllDates}`);
      
      // Check if any operations might be outside the date range
      const fromDate = dateRange.from;
      const toDate = dateRange.to;
      let outsideRangeCount = 0;
      
      filteredOperations.forEach(op => {
        const opDate = new Date(op.operation_date || op.date);
        if (opDate < fromDate || opDate > toDate) {
          outsideRangeCount++;
          console.log(`Operation outside range: ${op.id}, date: ${opDate.toISOString()}`);
        }
      });
      
      if (outsideRangeCount > 0) {
        console.warn(`Found ${outsideRangeCount} operations potentially outside date range!`);
      }
    }
  }, [operations, filteredOperations, clientId, isPepsiMen, dateRange, showAllDates]);

  // Initialize pendingDateRange when dateRange changes
  React.useEffect(() => {
    setPendingDateRange(dateRange);
  }, [dateRange]);

  // Function to apply the date filter
  const applyDateFilter = () => {
    setDateRange(pendingDateRange);
  };

  // Function to load operations
  const handleLoadOperations = () => {
    setShowOperations(true);
  };

  return (
    <Card className="shadow-sm w-full text-center text-gray-950 px-0 py-0 my-0 overflow-hidden">
      <CardHeader className="pb-2 px-3 py-3 text-left border-b bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-xl font-bold">Historique des opérations</CardTitle>
          <div className="flex gap-2">
            {!showOperations && (
              <Button onClick={handleLoadOperations} className="group">
                <Play className="h-4 w-4 mr-2" strokeWidth={2} />
                Charger les opérations
              </Button>
            )}
            {showOperations && (
              <Button variant="outline" size="sm" onClick={() => refreshOperations()} className="group">
                <RefreshCw className="h-4 w-4 mr-2 group-hover:animate-spin" strokeWidth={2} />
                Actualiser
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 py-0 w-full max-w-full">
        {!showOperations ? (
          <div className="p-8 text-center">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/30">
              <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground text-base mb-4">Cliquez sur "Charger les opérations" pour afficher l'historique</p>
              <Button onClick={handleLoadOperations} size="lg">
                <Play className="h-4 w-4 mr-2" strokeWidth={2} />
                Charger les opérations
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Search and filter section */}
            <div className="px-3 py-3 border-b">
              <div className="flex flex-col gap-3">
                {/* Search input */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher dans l'historique..." 
                    className="pl-9 py-2 h-10 bg-background/60" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                  />
                  {searchTerm && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0" 
                      onClick={() => setSearchTerm("")}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Date filter section */}
                <div className="flex items-start gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Switch 
                      checked={!showAllDates}
                      onCheckedChange={(checked) => setShowAllDates(!checked)}
                      id="show-date-range"
                    />
                    <label htmlFor="show-date-range" className="text-sm">
                      Filtrer par période
                    </label>
                  </div>
                </div>

                {/* Date picker and confirm button */}
                {!showAllDates && (
                  <div className="flex flex-col sm:flex-row gap-2 items-start">
                    <div className="flex-grow">
                      <DatePickerWithRange
                        date={pendingDateRange}
                        onDateChange={setPendingDateRange}
                        className="w-full"
                      />
                    </div>
                    <Button 
                      onClick={applyDateFilter} 
                      className="w-full sm:w-auto flex items-center gap-2"
                      variant="outline"
                      disabled={!pendingDateRange?.from || !pendingDateRange?.to}
                    >
                      <Check className="h-4 w-4" />
                      Confirmer la période
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Operations tabs */}
            <div className="px-0 pb-0">
              <ClientOperationsHistoryTabs 
                filteredOperations={filteredOperations} 
                currency="TND"
                clientName={clientName}
                updateOperation={updateOperation}
                onOperationDeleted={refreshOperations}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
