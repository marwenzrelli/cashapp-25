
import { Operation } from "@/features/operations/types";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { OperationsMobileCard } from "../OperationsMobileCard";
import { formatNumber } from "./OperationTypeHelpers";
import { TotalsSection } from "./TotalsSection";

interface OperationsMobileListProps {
  operations: Operation[];
  currency: string;
  selectedOperations: Record<string, boolean>;
  toggleSelection: (id: string) => void;
}

export const OperationsMobileList = ({
  operations,
  currency,
  selectedOperations,
  toggleSelection
}: OperationsMobileListProps) => {
  // Determine color based on operation type
  const getOperationTypeColor = (type: string): string => {
    switch (type) {
      case "deposit":
        return "text-green-600 dark:text-green-400";
      case "withdrawal":
        return "text-red-600 dark:text-red-400";
      case "transfer":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "";
    }
  };

  return (
    <div className="md:hidden space-y-3 w-full p-3">
      {operations.map((operation) => (
        <div 
          key={operation.id}
          className={cn(
            "transition-colors",
            selectedOperations[operation.id] ? "border-l-4 border-blue-500 pl-2" : ""
          )}
          onClick={() => toggleSelection(operation.id)}
        >
          <div className="flex items-center mb-2">
            <Checkbox 
              checked={selectedOperations[operation.id] || false}
              onCheckedChange={() => toggleSelection(operation.id)}
              onClick={(e) => e.stopPropagation()}
              className="mr-2"
            />
            <div className="w-full">
              <OperationsMobileCard 
                operation={operation}
                formatAmount={(amount) => {
                  const prefix = operation.type === "withdrawal" ? "-" : 
                             operation.type === "deposit" ? "+" : "";
                  return `${prefix}${formatNumber(amount)}`;
                }}
                currency={currency}
                colorClass={getOperationTypeColor(operation.type)}
                showType={true}
              />
            </div>
          </div>
        </div>
      ))}
      
      {/* Mobile Totals Card */}
      <TotalsSection operations={operations} currency={currency} isMobile={true} />
    </div>
  );
};
