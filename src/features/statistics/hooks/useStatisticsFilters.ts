
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

export const useStatisticsFilters = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [clientFilter, setClientFilter] = useState("");
  
  const [transactionType, setTransactionType] = useState<
    "all" | "deposits" | "withdrawals" | "transfers"
  >("all");

  return {
    dateRange,
    setDateRange,
    clientFilter,
    setClientFilter,
    transactionType,
    setTransactionType,
  };
};
