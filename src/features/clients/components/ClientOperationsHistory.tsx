
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Operation } from "@/features/operations/types";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { DateRange } from "react-day-picker";
import { ClientOperationsHistoryTabs } from "./operations-history/ClientOperationsHistoryTabs";
import { RefreshCw } from "lucide-react";

interface ClientOperationsHistoryProps {
  operations: Operation[];
  selectedType: Operation["type"] | "all";
  setSelectedType: (type: Operation["type"] | "all") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  isCustomRange: boolean;
  setIsCustomRange: (isCustom: boolean) => void;
  filteredOperations: Operation[];
  refreshOperations?: () => void;
}

export const ClientOperationsHistory = ({
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
}: ClientOperationsHistoryProps) => {
  return (
    <div className="space-y-6">
      {/* Search Filters Card */}
      <Card className="w-full shadow-md">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2 px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Recherche d'opérations</CardTitle>
          {refreshOperations && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshOperations}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <OperationFilters
            type={selectedType as any}
            setType={setSelectedType as any}
            client={searchTerm}
            setClient={setSearchTerm}
            date={dateRange}
            setDate={setDateRange}
          />
        </CardContent>
      </Card>

      {/* Operations History Tabs - now completely separate from content */}
      <ClientOperationsHistoryTabs 
        filteredOperations={filteredOperations} 
        currency="TND" 
      />
    </div>
  );
};
