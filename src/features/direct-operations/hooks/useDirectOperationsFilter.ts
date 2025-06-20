
import { useState, useMemo } from "react";
import { DirectOperation } from "../types";
import { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";

export const useDirectOperationsFilter = (operations: DirectOperation[]) => {
  const [filterClient, setFilterClient] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Fonction pour nettoyer tous les filtres
  const clearAllFilters = () => {
    setFilterClient("");
    setDateRange(undefined);
  };
  
  // Filtrage optimisé
  const filteredOperations = useMemo(() => {
    console.log(`Filtering ${operations.length} direct operations with criteria:`, { 
      client: filterClient, 
      dateRange: dateRange ? `${dateRange.from?.toISOString()} - ${dateRange.to?.toISOString()}` : 'none' 
    });
    
    return operations.filter(op => {
      // Skip null/undefined items
      if (!op) return false;
      
      try {
        // Client filtering - check both from and to client names
        if (filterClient) {
          const searchTerm = filterClient.toLowerCase();
          const fromClientMatch = op.from_client_name?.toLowerCase().includes(searchTerm);
          const toClientMatch = op.to_client_name?.toLowerCase().includes(searchTerm);
          
          if (!fromClientMatch && !toClientMatch) return false;
        }
        
        // Date range filtering
        if (dateRange?.from && dateRange?.to) {
          try {
            const opDate = new Date(op.operation_date);
            
            // Check if the date is valid
            if (isNaN(opDate.getTime())) {
              console.error(`Invalid operation date: ${op.operation_date} for operation ${op.id}`);
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
  }, [operations, filterClient, dateRange]);
  
  console.log(`Filtered direct operations: ${filteredOperations.length} (from ${operations.length} total)`);

  return {
    filterClient,
    setFilterClient,
    dateRange,
    setDateRange,
    clearAllFilters,
    isFiltering: !!filterClient || !!(dateRange?.from && dateRange?.to),
    filteredOperations
  };
};
