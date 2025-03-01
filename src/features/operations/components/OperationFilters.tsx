
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Operation } from "@/features/operations/types";
import { DateRange } from "react-day-picker";
import { Dispatch, SetStateAction } from "react";

export interface OperationFiltersProps {
  // Original props
  type?: string | null;
  setType?: (type: string | null) => void;
  client?: string;
  setClient?: (client: string) => void;
  date?: DateRange | undefined;
  setDate?: (date: DateRange | undefined) => void;
  
  // New props for ClientProfile.tsx
  selectedType?: Operation["type"] | "all";
  searchTerm?: string;
  isCustomRange?: boolean;
  onTypeSelect?: Dispatch<SetStateAction<Operation["type"] | "all">>;
  onSearch?: Dispatch<SetStateAction<string>>;
  onDateChange?: Dispatch<SetStateAction<{ from: Date; to: Date }>>;
  onCustomRangeChange?: Dispatch<SetStateAction<boolean>>;
}

export const OperationFilters = ({
  // Handle both original and new props
  type,
  setType,
  client,
  setClient,
  date,
  setDate,
  
  // New props
  selectedType,
  searchTerm,
  isCustomRange,
  onTypeSelect,
  onSearch,
  onDateChange,
  onCustomRangeChange,
}: OperationFiltersProps) => {
  // Determine which props to use based on what was passed
  const isUsingNewProps = selectedType !== undefined;
  
  // Handler for the type selection
  const handleTypeChange = (value: string) => {
    if (isUsingNewProps && onTypeSelect) {
      onTypeSelect(value as Operation["type"] | "all");
    } else if (setType) {
      setType(value === "" ? null : value);
    }
  };
  
  // Handler for search/client input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUsingNewProps && onSearch) {
      onSearch(e.target.value);
    } else if (setClient) {
      setClient(e.target.value);
    }
  };
  
  // Handler for date changes
  const handleDateChange = (newDate: DateRange | undefined) => {
    if (isUsingNewProps && onDateChange && newDate?.from) {
      onDateChange({
        from: newDate.from,
        to: newDate.to || newDate.from,
      });
      
      if (onCustomRangeChange) {
        onCustomRangeChange(true);
      }
    } else if (setDate) {
      setDate(newDate);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <Input
            placeholder={isUsingNewProps ? "Rechercher..." : "Rechercher par client..."}
            value={isUsingNewProps ? searchTerm : client}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={isUsingNewProps 
              ? selectedType
              : (type || "")} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type d'opération" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les opérations</SelectItem>
              <SelectItem value="all">Toutes les opérations</SelectItem>
              <SelectItem value="deposit">Versements</SelectItem>
              <SelectItem value="withdrawal">Retraits</SelectItem>
              <SelectItem value="transfer">Virements</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DatePickerWithRange 
          date={isUsingNewProps 
            ? { from: date?.from, to: date?.to }
            : date} 
          onDateChange={handleDateChange} 
        />
      </div>
    </div>
  );
};
