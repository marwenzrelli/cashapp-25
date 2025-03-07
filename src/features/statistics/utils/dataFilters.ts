
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
  if (!data || !Array.isArray(data)) {
    console.warn(`Invalid data for type ${type}:`, data);
    return [];
  }
  
  return data.filter(item => {
    if (!item) return false;
    
    try {
      const itemDate = new Date(item.operation_date || item.created_at || '');
      const dateMatch = !dateRange?.from || !dateRange?.to || 
        isWithinInterval(itemDate, { 
          start: dateRange.from, 
          end: dateRange.to 
        });
      
      const clientMatch = !clientFilter || 
        (type === "transfers" 
          ? (item.fromClient?.toLowerCase().includes(clientFilter.toLowerCase()) ||
             item.toClient?.toLowerCase().includes(clientFilter.toLowerCase()))
          : item.client_name?.toLowerCase().includes(clientFilter.toLowerCase()));

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
