
import { Operation } from "@/features/operations/types";
import { cn } from "@/lib/utils";
import { OperationsMobileCard } from "../OperationsMobileCard";
import { formatNumber } from "./OperationTypeHelpers";
import { TotalsSection } from "./TotalsSection";

interface OperationsMobileListProps {
  operations: Operation[];
  currency: string;
}

export const OperationsMobileList = ({
  operations,
  currency
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

  // Get border class based on operation type
  const getOperationBorderClass = (type: string): string => {
    switch (type) {
      case "deposit":
        return "border-l-4 border-green-500";
      case "withdrawal":
        return "border-l-4 border-red-500";
      case "transfer":
        return ""; // No specific border for transfers
      default:
        return "";
    }
  };

  return (
    <div className="md:hidden space-y-3 w-full p-3">
      {operations.map((operation) => (
        <div 
          key={operation.id}
          className={cn("w-full", getOperationBorderClass(operation.type))}
        >
          <div className="mb-2">
            <OperationsMobileCard 
              operation={operation}
              formatAmount={(amount) => {
                // Format the amount without adding symbols (let the component handle it)
                return formatNumber(Math.abs(amount));
              }}
              currency={currency}
              colorClass={getOperationTypeColor(operation.type)}
              showType={true}
            />
          </div>
        </div>
      ))}
      
      {/* Mobile Totals Card */}
      <TotalsSection operations={operations} currency={currency} isMobile={true} />
    </div>
  );
};
