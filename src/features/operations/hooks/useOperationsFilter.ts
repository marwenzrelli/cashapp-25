
import { useState, useMemo } from "react";
import { Operation } from "../types";
import { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import { operationMatchesSearch } from "../utils/display-helpers";

interface FilterOptions {
  filterType?: string | null;
  filterClient?: string;
  dateRange?: DateRange | undefined;
}

export const useOperationsFilter = (operations: Operation[], externalFilters?: FilterOptions) => {
  const [filterType, setFilterType] = useState<string | null>(externalFilters?.filterType || null);
  const [filterClient, setFilterClient] = useState(externalFilters?.filterClient || "");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(externalFilters?.dateRange);

  // Use external filters if provided, otherwise use internal state
  const activeFilterType = externalFilters?.filterType !== undefined ? externalFilters.filterType : filterType;
  const activeFilterClient = externalFilters?.filterClient !== undefined ? externalFilters.filterClient : filterClient;
  const activeDateRange = externalFilters?.dateRange !== undefined ? externalFilters.dateRange : dateRange;

  const clearAllFilters = () => {
    setFilterType(null);
    setFilterClient("");
    setDateRange(undefined);
  };

  const filteredOperations = useMemo(() => {
    console.log(`Filtering ${operations.length} operations with criteria:`, { 
      type: activeFilterType, 
      client: activeFilterClient, 
      dateRange: activeDateRange ? `${activeDateRange.from?.toISOString()} - ${activeDateRange.to?.toISOString()}` : 'none' 
    });
    
    return operations.filter(op => {
      // Skip null/undefined items
      if (!op) return false;
      
      try {
        // Type filtering
        if (activeFilterType && op.type !== activeFilterType) return false;
        
        // Client filtering
        if (activeFilterClient && !operationMatchesSearch(op, activeFilterClient)) return false;
        
        // Date range filtering with time consideration
        if (activeDateRange?.from && activeDateRange?.to) {
          try {
            const opDate = new Date(op.operation_date);
            
            // Check if the date is valid
            if (isNaN(opDate.getTime())) {
              console.error(`Invalid operation date: ${op.operation_date} for operation ${op.id}`);
              return false;
            }
            
            // Use the exact date-time from the range picker (no startOfDay/endOfDay)
            const startDate = new Date(activeDateRange.from);
            const endDate = new Date(activeDateRange.to);
            
            const isInRange = isWithinInterval(opDate, { start: startDate, end: endDate });
            
            if (!isInRange) {
              console.log(`Excluding operation ${op.id} with date ${opDate.toISOString()} - outside range ${startDate.toISOString()} to ${endDate.toISOString()}`);
            }
            
            return isInRange;
          } catch (error) {
            console.error("Error in date filtering:", error, op);
            return false;
          }
        }
        
        // If all filters pass, include the operation
        return true;
      } catch (err) {
        console.error("Error filtering operation:", err, op);
        return false;
      }
    });
  }, [operations, activeFilterType, activeFilterClient, activeDateRange]);
  
  console.log(`Filtered operations: ${filteredOperations.length} (from ${operations.length} total)`);

  return {
    filterType: activeFilterType,
    setFilterType,
    filterClient: activeFilterClient,
    setFilterClient,
    dateRange: activeDateRange,
    setDateRange,
    clearAllFilters,
    isFiltering: !!activeFilterType || !!activeFilterClient || !!(activeDateRange?.from && activeDateRange?.to),
    filteredOperations
  };
};
