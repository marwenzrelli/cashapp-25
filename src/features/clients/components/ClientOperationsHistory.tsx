
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { DateRange } from "react-day-picker";
import { ClientOperationsHistoryTabs } from "./operations-history/ClientOperationsHistoryTabs";

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
}: ClientOperationsHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des opérations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
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
