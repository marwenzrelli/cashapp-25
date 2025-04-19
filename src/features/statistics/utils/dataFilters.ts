
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
    return [];
  }
  
  return data.filter(item => {
    if (!item) return false;
    
    try {
      const dateStr = item.operation_date || item.created_at;
      
      if (!isValidDate(dateStr)) {
        return false;
      }
      
      const itemDate = new Date(dateStr);
      
      // If dateRange is undefined, don't filter by date (show all)
      const dateMatch = !dateRange?.from || !dateRange?.to || 
        isWithinInterval(itemDate, { 
          start: dateRange.from, 
          end: dateRange.to 
        });
      
      const clientName = item.client_name?.toLowerCase() || '';
      const fromClient = item.fromClient?.toLowerCase() || '';
      const toClient = item.toClient?.toLowerCase() || '';
      const searchTerm = clientFilter.toLowerCase();
      
      const clientMatch = !clientFilter || 
        (type === "transfers" 
          ? (fromClient.includes(searchTerm) || toClient.includes(searchTerm))
          : clientName.includes(searchTerm));

      const typeMatch = transactionType === "all" || 
        (transactionType === "deposits" && type === "deposits") ||
        (transactionType === "withdrawals" && type === "withdrawals") ||
        (transactionType === "transfers" && type === "transfers");

      return dateMatch && clientMatch && typeMatch;
    } catch (err) {
      return false;
    }
  });
};
