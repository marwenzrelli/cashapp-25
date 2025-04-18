
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { SearchBar } from "../SearchBar";
import { DateRange } from "react-day-picker";

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  itemsPerPage: string;
  onItemsPerPageChange: (value: string) => void;
  totalWithdrawals: number;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchTerm,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalWithdrawals,
  dateRange,
  onDateRangeChange
}) => {
  return (
    <Card className="w-full mx-0">
      <CardHeader>
        <CardTitle>Recherche intelligente</CardTitle>
        <CardDescription>
          Trouvez rapidement un retrait
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          totalWithdrawals={totalWithdrawals}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
        />
      </CardContent>
    </Card>
  );
};
