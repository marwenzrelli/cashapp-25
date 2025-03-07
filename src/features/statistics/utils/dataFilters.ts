
import { isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

interface FilteredData {
  client_name?: string;
  fromClient?: string;
  toClient?: string;
  amount: number;
  created_at?: string;
  operation_date?: string;
}

/**
 * Safely checks if a date is valid
 */
const isValidDate = (dateStr: any): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

export const filterData = (
  data: FilteredData[], 
  type: string, 
  dateRange: DateRange | undefined,
  clientFilter: string,
  transactionType: "all" | "deposits" | "withdrawals" | "transfers"
) => {
  // Validate input data
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return data.filter(item => {
    // Skip null/undefined items
    if (!item) return false;
    
    try {
      // Get date from item
      const dateStr = item.operation_date || item.created_at;
      
      // Skip items with invalid dates
      if (!isValidDate(dateStr)) {
        return false;
      }
      
      const itemDate = new Date(dateStr);
      
      // Date range filtering
      const dateMatch = !dateRange?.from || !dateRange?.to || 
        isWithinInterval(itemDate, { 
          start: dateRange.from, 
          end: dateRange.to 
        });
      
      // Client name filtering
      const clientName = item.client_name?.toLowerCase() || '';
      const fromClient = item.fromClient?.toLowerCase() || '';
      const toClient = item.toClient?.toLowerCase() || '';
      const searchTerm = clientFilter.toLowerCase();
      
      const clientMatch = !clientFilter || 
        (type === "transfers" 
          ? (fromClient.includes(searchTerm) || toClient.includes(searchTerm))
          : clientName.includes(searchTerm));

      // Transaction type filtering
      const typeMatch = transactionType === "all" || 
        (transactionType === "deposits" && type === "deposits") ||
        (transactionType === "withdrawals" && type === "withdrawals") ||
        (transactionType === "transfers" && type === "transfers");

      return dateMatch && clientMatch && typeMatch;
    } catch (err) {
      // Silently handle errors to prevent console noise
      return false;
    }
  });
};
