import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Operation } from "@/features/operations/types";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock } from "lucide-react";
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
  return <div className="flex flex-col p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden w-full px-[9px]">
      <div className="flex items-start justify-between mb-2">
        {showType && <Badge variant={operation.type === "deposit" ? "default" : operation.type === "withdrawal" ? "destructive" : "outline"} className="text-xs">
            {operation.type === "deposit" ? "Dépôt" : operation.type === "withdrawal" ? "Retrait" : "Transfert"}
          </Badge>}
        <p className={`text-base sm:text-lg font-semibold ${colorClass || (operation.type === "withdrawal" ? "text-red-500" : operation.type === "deposit" ? "text-green-500" : "text-blue-500")}`}>
          {operation.type === "withdrawal" ? "-" : operation.type === "deposit" ? "+" : ""}
          {formatAmount(operation.amount)}
          {currency && ` ${currency}`}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
        <div className="flex items-center gap-1">
          <CalendarClock className="h-3 w-3" />
          <span>{formatDate(operationDate, "dd MMM yyyy")}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(operationDate, "HH:mm")}</span>
        </div>
      </div>
      
      {operation.description && <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 mb-2 line-clamp-2 break-words">{operation.description}</p>}
      
      {operation.type === "transfer" && <div className="text-xs text-muted-foreground border-t pt-2 mt-1">
          <p className="truncate">De: {operation.fromClient}</p>
          <p className="truncate">À: {operation.toClient}</p>
        </div>}
      
      <div className="text-right mt-auto">
        <span className="text-xs text-muted-foreground">#{operation.id}</span>
      </div>
    </div>;
};