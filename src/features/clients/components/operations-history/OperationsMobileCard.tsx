
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
  formatAmount = (amount) => `${Math.round(amount).toLocaleString()}`,
  currency = "",
  showType = true,
  colorClass
}: OperationsMobileCardProps) => {
  // Use operation_date if available, otherwise fall back to date
  const operationDate = operation.operation_date ? new Date(operation.operation_date) : new Date(operation.date);
  
  return (
    <div className="flex items-start justify-between p-4 bg-white rounded-lg border shadow-sm">
      <div className="space-y-2">
        {showType && (
          <div className="flex items-center gap-2">
            <Badge variant={operation.type === "deposit" ? "default" : operation.type === "withdrawal" ? "destructive" : "outline"}>
              {operation.type === "deposit" ? "Dépôt" : operation.type === "withdrawal" ? "Retrait" : "Transfert"}
            </Badge>
            <span className="text-xs text-muted-foreground">#{operation.id}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarClock className="h-3 w-3" />
          <span>{format(operationDate, "dd MMMM yyyy", { locale: fr })}</span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{format(operationDate, "HH:mm", { locale: fr })}</span>
        </div>
        
        {operation.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{operation.description}</p>
        )}
      </div>
      
      <div className="text-right">
        <p className={`text-lg font-semibold ${colorClass || (operation.type === "withdrawal" ? "text-red-500" : operation.type === "deposit" ? "text-green-500" : "text-blue-500")}`}>
          {operation.type === "withdrawal" ? "-" : operation.type === "deposit" ? "+" : ""}
          {formatAmount(operation.amount)}
          {currency && ` ${currency}`}
        </p>
      </div>
    </div>
  );
};
