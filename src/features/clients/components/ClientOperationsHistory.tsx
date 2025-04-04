
import React, { useEffect } from "react";
import { Operation } from "@/features/operations/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { RefreshCw, Search, XCircle } from "lucide-react";
import { ClientOperationsHistoryTabs } from "./operations-history/ClientOperationsHistoryTabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  refreshOperations: () => void;
  showAllDates?: boolean;
  setShowAllDates?: (showAll: boolean) => void;
  clientId?: number;
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
  clientId
}) => {
  // Special handling for pepsi men (client ID 4)
  const isPepsiMen = clientId === 4;
  
  // Debug log for pepsi men operations
  useEffect(() => {
    if (isPepsiMen) {
      console.log(`ClientOperationsHistory - Total operations for client ID ${clientId}: ${operations.length}`);
      console.log(`ClientOperationsHistory - Filtered operations: ${filteredOperations.length}`);
      
      const withdrawals = operations.filter(op => op.type === "withdrawal");
      console.log(`ClientOperationsHistory - Total withdrawals: ${withdrawals.length}`);
      console.log(`Withdrawal IDs: ${withdrawals.map(w => w.id).join(', ')}`);
    }
  }, [operations, filteredOperations, clientId, isPepsiMen]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-xl">Historique des opérations</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOperations}
            className="group"
          >
            <RefreshCw
              className="h-4 w-4 mr-2 group-hover:animate-spin"
              strokeWidth={2}
            />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 px-4 sm:px-0">
          <div className="relative w-full sm:w-2/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans l'historique..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setSearchTerm("")}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="w-full sm:w-1/3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-all-dates"
                  checked={showAllDates}
                  onCheckedChange={setShowAllDates}
                  disabled={isPepsiMen} // Disable for pepsi men to force showing all dates
                />
                <Label htmlFor="show-all-dates">Afficher toutes les périodes</Label>
              </div>
            </div>
            {!showAllDates && !isPepsiMen && (
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            )}
          </div>
        </div>

        <ClientOperationsHistoryTabs
          filteredOperations={filteredOperations}
        />
      </CardContent>
    </Card>
  );
};
