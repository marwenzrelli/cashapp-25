
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
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Historique des opérations</CardTitle>
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
      <CardContent className="px-2 sm:px-6">
        <div className="mb-4 sm:mb-6 overflow-x-auto">
          <OperationFilters
            type={selectedType as any}
            setType={setSelectedType as any}
            client={searchTerm}
            setClient={setSearchTerm}
            date={dateRange}
            setDate={setDateRange}
          />
        </div>

        <ClientOperationsHistoryTabs 
          filteredOperations={filteredOperations} 
          currency="TND" 
        />
      </CardContent>
    </Card>
  );
};
