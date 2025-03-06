
import { Calendar, FileText, User } from "lucide-react";
import { format } from "date-fns";
import { Operation } from "@/features/operations/types";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";

interface OperationsMobileCardProps {
  operation: Operation;
  currency?: string;
  showType?: boolean;
  colorClass?: string;
}

export const OperationsMobileCard = ({ 
  operation, 
  currency = "TND", 
  showType = true,
  colorClass 
}: OperationsMobileCardProps) => {
  // Use operation_date if available, otherwise fall back to date
  const displayDate = operation.operation_date || operation.date;
  
  return (
    <div key={operation.id} className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {showType && (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
              {getTypeIcon(operation.type)}
            </div>
          )}
          <span className="font-medium">{getTypeLabel(operation.type)}</span>
        </div>
        <span className={`font-semibold text-center pl-4 ${colorClass}`}>
          {operation.type === "withdrawal" ? "-" : ""}
          {Math.round(operation.amount)} {currency}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{format(new Date(displayDate), "dd/MM/yyyy HH:mm")}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          {operation.type === "transfer" ? (
            <span className="truncate">
              {operation.fromClient} → {operation.toClient}
            </span>
          ) : (
            <span className="truncate">{operation.fromClient}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground col-span-2">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{operation.description}</span>
        </div>
      </div>
    </div>
  );
};
