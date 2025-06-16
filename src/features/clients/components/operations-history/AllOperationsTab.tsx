
import { Operation } from "@/features/operations/types";
import { OperationsDesktopTable } from "./all-operations/OperationsDesktopTable";
import { OperationsMobileList } from "./all-operations/OperationsMobileList";
import { TotalsSection } from "./all-operations/TotalsSection";

interface AllOperationsTabProps {
  operations: Operation[];
  currency: string;
  isPublicView?: boolean;
}

export const AllOperationsTab = ({ 
  operations, 
  currency,
  isPublicView = false 
}: AllOperationsTabProps) => {
  return (
    <div className="space-y-4">
      <TotalsSection operations={operations} />
      <OperationsDesktopTable 
        operations={operations} 
        currency={currency}
        isPublicView={isPublicView}
      />
      <OperationsMobileList 
        operations={operations} 
        currency={currency}
        isPublicView={isPublicView}
      />
    </div>
  );
};
