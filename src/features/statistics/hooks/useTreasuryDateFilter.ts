
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Operation } from "@/features/operations/types";
import { filterByDateRange } from "../utils/dateHelpers";

export const useTreasuryDateFilter = (operations: Operation[]) => {
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

  return {
    showDatePicker,
    dateRange,
    setDateRange,
    handlePeriodChange,
    filteredOperations,
  };
};
