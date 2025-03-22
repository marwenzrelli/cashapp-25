
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  itemsPerPage: string;
  onItemsPerPageChange: (value: string) => void;
  totalWithdrawals: number;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalWithdrawals,
  dateRange,
  onDateRangeChange,
}: SearchBarProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center w-full">
      <div className="w-full md:w-1/3 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un retrait..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9"
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
            Retraits par page:
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
          Total: {totalWithdrawals}
        </span>
      </div>
    </div>
  );
};
