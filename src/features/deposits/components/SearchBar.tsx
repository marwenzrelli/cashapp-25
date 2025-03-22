
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  itemsPerPage: string;
  onItemsPerPageChange: (value: string) => void;
  totalDeposits: number;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalDeposits,
  dateRange,
  onDateRangeChange,
}: SearchBarProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center w-full">
      <div className="w-full md:w-1/3">
        <Input
          placeholder="Rechercher un versement..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="w-full md:w-1/3">
        <DatePickerWithRange 
          date={dateRange} 
          onDateChange={onDateRangeChange} 
        />
      </div>
      
      <div className="flex items-center justify-between w-full md:w-1/3 md:justify-end gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Versements par page:
          </span>
          <Select
            value={itemsPerPage}
            onValueChange={onItemsPerPageChange}
          >
            <SelectTrigger className="w-16">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Total: {totalDeposits}
        </span>
      </div>
    </div>
  );
};
