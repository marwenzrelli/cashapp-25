
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Operation } from "@/features/operations/types";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock, Hash } from "lucide-react";
import { formatId } from "@/utils/formatId";

interface OperationsMobileCardProps {
  operation: Operation;
  formatAmount?: (amount: number) => string;
  currency?: string;
  showType?: boolean;
  colorClass?: string;
}

export const OperationsMobileCard = ({
  operation,
  formatAmount = amount => `${Math.round(amount).toLocaleString()}`,
  currency = "",
  showType = true,
  colorClass
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
  
  // Format the operation ID
  const operationId = isNaN(parseInt(operation.id)) ? operation.id : formatId(parseInt(operation.id));
  
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
            className="text-xs mr-2"
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
            <span className="text-xs font-mono text-muted-foreground">{operationId}</span>
          </div>
          <p className={`text-base font-semibold ${
            colorClass || (
              operation.type === "withdrawal" 
                ? "text-red-500" 
                : operation.type === "deposit" 
                  ? "text-green-500" 
                  : "text-blue-500"
            )}`}
          >
            {operation.type === "withdrawal" ? "-" : operation.type === "deposit" ? "+" : ""}
            {formatAmount(operation.amount)}
            {currency && ` ${currency}`}
          </p>
        </div>
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
          <p className="truncate">De: {operation.fromClient}</p>
          <p className="truncate">À: {operation.toClient}</p>
        </div>
      )}
    </div>
  );
};
