import { format, parseISO } from "date-fns";

export interface Operation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer" | "direct_transfer";
  amount: number;
  date: string;
  createdAt?: string;
  operation_date?: string; 
  description?: string;
  fromClient?: string;
  toClient?: string;
  formattedDate?: string;
  client_id?: number;
  status?: string;
}

// Add ClientStats interface that was missing
export interface ClientStats {
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
}

export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return "Date invalide";
  }
};
