
import React from "react";
import { Operation } from "@/features/operations/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { RefreshCw, Search, XCircle } from "lucide-react";
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
  refreshOperations: () => void;
  showAllDates?: boolean;
  setShowAllDates?: (showAll: boolean) => void;
  clientId?: number;
  isPepsiMen?: boolean;
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
  updateOperation
}) => {
  // Log operations data for pepsi men for debugging
  React.useEffect(() => {
    if (isPepsiMen) {
      console.log(`ClientOperationsHistory - Total operations for client ID ${clientId}: ${operations.length}`);
      console.log(`ClientOperationsHistory - Filtered operations: ${filteredOperations.length}`);
      const withdrawals = operations.filter(op => op.type === "withdrawal");
      console.log(`ClientOperationsHistory - Total withdrawals: ${withdrawals.length}`);
      console.log(`Withdrawal IDs: ${withdrawals.map(w => w.id).join(', ')}`);
    }
  }, [operations, filteredOperations, clientId, isPepsiMen]);

  return (
    <Card className="shadow-sm w-full text-center text-gray-950 px-0 py-0 my-0 overflow-hidden">
      <CardHeader className="pb-2 px-3 py-3 text-left border-b bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-xl font-bold">Historique des opérations</CardTitle>
          <Button variant="outline" size="sm" onClick={refreshOperations} className="group">
            <RefreshCw className="h-4 w-4 mr-2 group-hover:animate-spin" strokeWidth={2} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 py-0 w-full max-w-full">
        {/* Champ de recherche avec meilleur design */}
        <div className="px-3 py-3 border-b">
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
        </div>

        {/* Les onglets d'opérations avec une meilleure organisation de l'espace */}
        <div className="px-0 pb-0">
          <ClientOperationsHistoryTabs 
            filteredOperations={filteredOperations} 
            updateOperation={updateOperation}
            onOperationDeleted={refreshOperations}
          />
        </div>
      </CardContent>
    </Card>
  );
};
