
import React, { useState } from "react";
import { TreasuryTable } from "./TreasuryTable";
import { TreasuryTotals } from "./TreasuryTotals";
import { Card, CardContent } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { filterByDateRange } from "../../utils/dateHelpers";

interface TreasuryTabProps {
  operations: Operation[];
  isLoading: boolean;
}

export const TreasuryTab = ({ operations, isLoading }: TreasuryTabProps) => {
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handlePeriodChange = (value: string) => {
    if (value === "all") {
      setDateRange(undefined);
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
    }
  };

  const filteredOperations = showDatePicker && dateRange?.from && dateRange?.to
    ? filterByDateRange(operations, dateRange.from, dateRange.to)
    : operations;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-full bg-muted rounded" />
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-8 w-5/6 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="w-full max-w-sm space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Période</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {showDatePicker ? "Période spécifique" : "Toute la période"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handlePeriodChange("specific")}>
                  Période spécifique
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handlePeriodChange("all")}>
                  Toute la période
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {showDatePicker && (
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <TreasuryTable operations={filteredOperations} />
        </CardContent>
      </Card>
      <TreasuryTotals operations={filteredOperations} />
    </div>
  );
};
