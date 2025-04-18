import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Operation } from "@/features/operations/types";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Clock, Hash, User } from "lucide-react";
import { formatId } from "@/utils/formatId";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { formatNumber } from "@/features/clients/components/operations-history/all-operations/OperationTypeHelpers";

interface OperationsMobileCardProps {
  operation: Operation;
  formatAmount?: (amount: number) => string;
  currency?: string;
  showType?: boolean;
  colorClass?: string;
  showId?: boolean;
  typeBackgroundClass?: string;
  icon?: ReactNode;
}

export const OperationsMobileCard = ({
  operation,
  formatAmount = amount => 
    operation.type === 'deposit' ? `+ ${formatNumber(amount)}` : 
    operation.type === 'withdrawal' ? `- ${formatNumber(amount)}` : 
    formatNumber(amount),
  currency = "",
  showType = true,
  colorClass,
  showId = false,
  typeBackgroundClass,
  icon
}: OperationsMobileCardProps) => {
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

  const operationDate = operation.operation_date || operation.date;

  const clientName = operation.type === "transfer" ? `${operation.fromClient || ''} → ${operation.toClient || ''}` : operation.fromClient || '';

  return <div className="flex flex-col p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm w-full">
      <div className="flex items-center justify-between mb-3">
        {showType && <Badge variant="outline" className={cn("text-xs mr-2", typeBackgroundClass, operation.type === "deposit" ? "border-green-500 text-green-700 dark:text-green-400" : operation.type === "withdrawal" ? "border-red-500 text-red-700 dark:text-red-400" : "border-blue-500 text-blue-700 dark:text-blue-400")}>
            {operation.type === "deposit" ? "Dépôt" : operation.type === "withdrawal" ? "Retrait" : "Transfert"}
          </Badge>}
        <div className="flex-1 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Hash className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              {showId && operation.id}
            </span>
          </div>
          <p className={`text-lg font-semibold px-3 py-1 rounded-md ${colorClass || (operation.type === "withdrawal" ? "text-red-500 bg-red-50 dark:bg-red-900/20" : operation.type === "deposit" ? "text-green-500 bg-green-50 dark:bg-green-900/20" : "text-blue-500 bg-blue-50 dark:bg-blue-900/20")}`}>
            {formatAmount(operation.amount)}
            {currency && ` ${currency}`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 mb-3 text-sm">
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 overflow-hidden text-ellipsis">
          {clientName}
        </span>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <CalendarClock className="h-3 w-3" />
          <span>{formatDate(operationDate, "dd MMM yyyy")}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(operationDate, "HH:mm")}</span>
        </div>
      </div>
      
      {operation.description && <p className="text-sm text-gray-700 dark:text-gray-300 my-1 break-words p-2 bg-gray-50 dark:bg-gray-700/30 rounded-md">
          {operation.description}
        </p>}
      
      {operation.type === "transfer" && <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
          <p className="truncate px-2 py-1 my-0.5 rounded-md bg-orange-50 dark:bg-orange-900/20">De: {operation.fromClient}</p>
          <p className="truncate px-2 py-1 my-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20">À: {operation.toClient}</p>
        </div>}
    </div>;
};
