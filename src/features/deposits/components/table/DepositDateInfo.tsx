
import { Clock, Calendar } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { formatDateTime } from "@/features/deposits/hooks/utils/dateUtils";
import { type Deposit } from "@/components/deposits/types";

interface DepositDateInfoProps {
  deposit: Deposit;
}

export const DepositDateInfo = ({ deposit }: DepositDateInfoProps) => {
  // Prioritize using operation_date for display
  const displayDate = deposit.operation_date 
    ? formatDateTime(deposit.operation_date)
    : deposit.date;
  
  // Check if there's a difference between operation_date and created_at
  const isCustomDate = deposit.operation_date !== undefined && 
    deposit.operation_date !== null && 
    new Date(deposit.operation_date).getTime() !== new Date(deposit.created_at).getTime();
    
  const hasBeenModified = deposit.last_modified_at !== undefined && deposit.last_modified_at !== null;
  
  if (!isCustomDate && !hasBeenModified) {
    return <div>{displayDate}</div>;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            {displayDate}
            {isCustomDate && <Calendar className="h-3.5 w-3.5 text-blue-500" />}
            {hasBeenModified && <Clock className="h-3.5 w-3.5 text-amber-500" />}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Date de création: {formatDateTime(deposit.created_at)}</p>
          {isCustomDate && (
            <p>Date d'opération: {formatDateTime(deposit.operation_date)}</p>
          )}
          {hasBeenModified && (
            <p>Modifié le {formatDateTime(deposit.last_modified_at)}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
