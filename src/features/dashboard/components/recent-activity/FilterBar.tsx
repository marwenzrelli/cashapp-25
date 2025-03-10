
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { DateRange } from "react-day-picker";

interface FilterBarProps {
  tempSearchTerm: string;
  setTempSearchTerm: (value: string) => void;
  tempOperationType: string | null;
  setTempOperationType: (value: string | null) => void;
  tempDateRange: DateRange | undefined;
  setTempDateRange: (value: DateRange | undefined) => void;
  applyFilters: () => void;
}

export const FilterBar = ({
  tempSearchTerm,
  setTempSearchTerm,
  tempOperationType,
  setTempOperationType,
  tempDateRange,
  setTempDateRange,
  applyFilters
}: FilterBarProps) => {
  return (
    <div className="space-y-3">
      <OperationFilters
        type={tempOperationType}
        setType={setTempOperationType}
        client={tempSearchTerm}
        setClient={setTempSearchTerm}
        date={tempDateRange}
        setDate={setTempDateRange}
      />
      
      {/* OK button to apply filters */}
      <Button 
        onClick={applyFilters}
        variant="outline" 
        className="w-full bg-primary/5 hover:bg-primary/10 transition-colors"
      >
        <Check className="mr-2 h-4 w-4 text-primary" />
        Valider les filtres
      </Button>
    </div>
  );
};
