
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
  // Vérifier si operation_date existe et est différent de created_at
  const hasCustomDate = deposit.operation_date !== undefined && 
    deposit.operation_date !== null && 
    new Date(deposit.operation_date).getTime() !== new Date(deposit.created_at).getTime();
    
  const hasBeenModified = deposit.last_modified_at !== undefined && deposit.last_modified_at !== null;
  
  if (!hasCustomDate && !hasBeenModified) {
    return <div>{deposit.date}</div>;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            {deposit.date}
            {hasCustomDate && <Calendar className="h-3.5 w-3.5 text-blue-500" />}
            {hasBeenModified && <Clock className="h-3.5 w-3.5 text-amber-500" />}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Date de création: {formatDateTime(deposit.created_at)}</p>
          {hasCustomDate && (
            <p>Date d'opération personnalisée: {formatDateTime(deposit.operation_date)}</p>
          )}
          {hasBeenModified && (
            <p>Modifié le {formatDateTime(deposit.last_modified_at)}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
