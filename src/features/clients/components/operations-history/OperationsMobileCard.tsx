
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Operation } from "@/features/operations/types";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock, Hash, User } from "lucide-react";
import { formatId } from "@/utils/formatId";

interface OperationsMobileCardProps {
  operation: Operation;
  formatAmount?: (amount: number) => string;
  currency?: string;
  showType?: boolean;
  colorClass?: string;
  showId?: boolean;
}

export const OperationsMobileCard = ({
  operation,
  formatAmount = amount => `${Math.round(amount).toLocaleString()}`,
  currency = "",
  showType = true,
  colorClass,
  showId = false
}: OperationsMobileCardProps) => {
  // Fonction sécurisée pour parser les dates
  const parseDate = (dateValue: string | Date): Date => {
    if (dateValue instanceof Date) return dateValue;
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      return date;
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date(); // Fallback to current date
    }
  };

  // Fonction sécurisée pour formater les dates
  const formatDate = (dateValue: string | Date, formatStr: string): string => {
    try {
      const date = parseDate(dateValue);
      return format(date, formatStr, {
        locale: fr
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date inconnue";
    }
  };

  // Use operation_date if available, otherwise fall back to date
  const operationDate = operation.operation_date || operation.date;
  
  // Determine which client name to show based on operation type
  const clientName = operation.type === "transfer" 
    ? `${operation.fromClient || ''} → ${operation.toClient || ''}`
    : operation.fromClient || '';
  
  return (
    <div className="flex flex-col p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm w-full">
      <div className="flex items-center justify-between mb-2">
        {showType && (
          <Badge 
            variant={
              operation.type === "deposit" 
                ? "default" 
                : operation.type === "withdrawal" 
                  ? "destructive" 
                  : "outline"
            } 
            className={
              operation.type === "deposit"
                ? "text-xs mr-2 bg-green-500 hover:bg-green-600"
                : "text-xs mr-2"
            }
          >
            {operation.type === "deposit" 
              ? "Dépôt" 
              : operation.type === "withdrawal" 
                ? "Retrait" 
                : "Transfert"
            }
          </Badge>
        )}
        <div className="flex-1 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Hash className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {showId && operation.id}
            </span>
          </div>
          <p className={`text-base font-semibold px-2 py-0.5 rounded-md ${
            colorClass || (
              operation.type === "withdrawal" 
                ? "text-red-500 bg-red-50 dark:bg-red-900/20" 
                : operation.type === "deposit" 
                  ? "text-green-500 bg-green-50 dark:bg-green-900/20" 
                  : "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
            )}`}
          >
            {operation.type === "withdrawal" ? "-" : operation.type === "deposit" ? "+" : ""}
            {formatAmount(operation.amount)}
            {currency && ` ${currency}`}
          </p>
        </div>
      </div>
      
      {/* Add client name display with icon */}
      <div className="flex items-center gap-1 mb-2 text-sm">
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/20">
          {clientName}
        </span>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <div className="flex items-center gap-1">
          <CalendarClock className="h-3 w-3" />
          <span>{formatDate(operationDate, "dd MMM yyyy")}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(operationDate, "HH:mm")}</span>
        </div>
      </div>
      
      {operation.description && (
        <p className="text-sm text-gray-700 dark:text-gray-300 my-1 break-words">
          {operation.description}
        </p>
      )}
      
      {operation.type === "transfer" && (
        <div className="text-xs text-muted-foreground border-t pt-1 mt-1">
          <p className="truncate px-2 py-0.5 my-0.5 rounded-md bg-orange-50 dark:bg-orange-900/20">De: {operation.fromClient}</p>
          <p className="truncate px-2 py-0.5 my-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20">À: {operation.toClient}</p>
        </div>
      )}
    </div>
  );
};
