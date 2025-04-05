
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

  return (
    <div className="md:hidden space-y-3 w-full p-3">
      {operations.map((operation) => (
        <div 
          key={operation.id}
          className="w-full"
        >
          <div className="mb-2">
            <OperationsMobileCard 
              operation={operation}
              formatAmount={(amount) => {
                // Fix the formattage to avoid double symbols
                const formattedAmount = formatNumber(amount);
                return formattedAmount;
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
