
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

export const filterData = (
  data: FilteredData[], 
  type: string, 
  dateRange: DateRange | undefined,
  clientFilter: string,
  transactionType: "all" | "deposits" | "withdrawals" | "transfers"
) => {
  // Validate input data
  if (!data || !Array.isArray(data)) {
    console.warn(`Invalid data for type ${type}:`, data);
    return [];
  }
  
  return data.filter(item => {
    // Skip null/undefined items
    if (!item) return false;
    
    try {
      // Get date from item - fallback to current date if invalid
      let itemDate: Date;
      try {
        itemDate = new Date(item.operation_date || item.created_at || '');
        // Check if date is valid
        if (isNaN(itemDate.getTime())) {
          console.warn(`Invalid date for ${type}:`, item.operation_date || item.created_at);
          itemDate = new Date(); // Fallback to current date
        }
      } catch (error) {
        console.warn(`Error parsing date for ${type}:`, error);
        itemDate = new Date(); // Fallback to current date
      }
      
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
      console.error(`Error filtering ${type} item:`, err, item);
      return false;
    }
  });
};
