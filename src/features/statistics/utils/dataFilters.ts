
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";

interface FilteredData {
  client_name?: string;
  fromClient?: string;
  toClient?: string;
  amount: number;
  created_at?: string;
  operation_date?: string;
}

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
  if (!data || !Array.isArray(data)) {
    console.log("No data to filter or data is not an array");
    return [];
  }
  
  // If no filters are active, return all data
  if (!dateRange?.from && !dateRange?.to && !clientFilter && transactionType === "all") {
    return data;
  }
  
  console.log(`Filtering data with type=${type}, clientFilter=${clientFilter}, dateRange=${dateRange?.from?.toISOString()} - ${dateRange?.to?.toISOString()}`);
  
  return data.filter(item => {
    if (!item) return false;
    
    try {
      const dateStr = item.operation_date || item.created_at;
      
      if (!isValidDate(dateStr)) {
        return false;
      }
      
      const itemDate = new Date(dateStr);
      
      // Date range filtering
      let dateMatch = true;
      if (dateRange?.from && dateRange?.to) {
        // Use proper date boundaries for comparison
        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        
        try {
          dateMatch = isWithinInterval(itemDate, { start: startDate, end: endDate });
        } catch (error) {
          console.error("Date interval error:", error);
          dateMatch = false;
        }
      }
      
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
      console.error("Error filtering data:", err);
      return false;
    }
  });
};
