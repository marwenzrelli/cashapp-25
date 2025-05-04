
import { useState, useMemo } from "react";
import { Operation } from "../types";
import { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { operationMatchesSearch } from "../utils/display-helpers";

export const useOperationsFilter = (operations: Operation[]) => {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Filtrage optimisé - sans limitation artificielle du nombre de résultats
  const filteredOperations = useMemo(() => {
    console.log(`Filtering ${operations.length} operations with criteria:`, { 
      type: filterType, 
      client: filterClient, 
      dateRange: dateRange ? `${dateRange.from?.toISOString()} - ${dateRange.to?.toISOString()}` : 'none' 
    });
    
    return operations.filter(op => {
      // Skip null/undefined items
      if (!op) return false;
      
      try {
        // Type filtering
        if (filterType && op.type !== filterType) return false;
        
        // Client/search filtering
        if (filterClient && !operationMatchesSearch(op, filterClient)) return false;
        
        // Date range filtering
        if (dateRange?.from && dateRange?.to) {
          try {
            const opDate = new Date(op.operation_date || op.date);
            
            // Check if the date is valid
            if (isNaN(opDate.getTime())) {
              console.error(`Invalid operation date: ${op.operation_date || op.date} for operation ${op.id}`);
              return false;
            }
            
            // Normalize date boundaries for more accurate comparison
            const startDate = startOfDay(dateRange.from);
            const endDate = endOfDay(dateRange.to);
            
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
  }, [operations, filterType, filterClient, dateRange]);
  
  console.log(`Filtered operations: ${filteredOperations.length} (from ${operations.length} total)`);

  return {
    filterType,
    setFilterType,
    filterClient,
    setFilterClient,
    dateRange,
    setDateRange,
    isFiltering: !!filterType || !!filterClient || !!(dateRange?.from && dateRange?.to),
    filteredOperations
  };
};
