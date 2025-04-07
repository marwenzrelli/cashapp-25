
import { Operation } from "@/features/operations/types";
import { Button } from "@/components/ui/button";
import { Trash2, User, CalendarIcon, ClockIcon } from "lucide-react";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { formatOperationId, getAmountColor } from "../../utils/display-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "../utils/format-helpers";

interface OperationsMobileListProps {
  operations: Operation[];
  isLoading: boolean;
  onDelete: (operation: Operation) => void;
}

export const OperationsMobileList = ({ 
  operations, 
  isLoading, 
  onDelete 
}: OperationsMobileListProps) => {
  if (isLoading) {
    return renderMobileSkeletons();
  }

  if (operations.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden space-y-3 p-3 w-full">
      {operations.map((operation) => (
        <div key={`${operation.type}-${operation.id}`} 
             className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                {getTypeIcon(operation.type)}
              </div>
              <div>
                <span className="font-medium">{getTypeLabel(operation.type)}</span>
                <p className="text-xs text-muted-foreground">#{formatOperationId(operation.id)}</p>
              </div>
            </div>
            
            <span className={`text-lg font-semibold px-3 py-1 rounded-md ${getAmountColor(operation.type)}`}>
              {operation.type === "withdrawal" ? "-" : ""}{formatNumber(operation.amount)} TND
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{operation.formattedDate?.split(' ')[0] || ''}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              <span>{operation.formattedDate?.split(' ')[1] || ''}</span>
            </div>
          </div>
          
          {operation.description && (
            <p className="text-sm mb-3 line-clamp-2 break-words px-3 py-2 bg-gray-50 dark:bg-gray-700/20 rounded-md">
              {operation.description}
            </p>
          )}
          
          <div className="text-xs text-muted-foreground mb-3">
            {operation.type === "transfer" ? (
              <>
                <div className="flex items-center gap-1 truncate"><User className="h-3 w-3 flex-shrink-0" /> De: {operation.fromClient}</div>
                <div className="flex items-center gap-1 truncate"><User className="h-3 w-3 flex-shrink-0" /> À: {operation.toClient}</div>
              </>
            ) : (
              <div className="flex items-center gap-1 truncate"><User className="h-3 w-3 flex-shrink-0" /> {operation.fromClient}</div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(operation)}
              className="h-10 px-4 text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to render mobile loading skeletons
function renderMobileSkeletons() {
  return (
    <div className="md:hidden space-y-3 p-3 w-full">
      {Array(3).fill(0).map((_, index) => (
        <div key={`mobile-skeleton-${index}`} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm w-full">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
