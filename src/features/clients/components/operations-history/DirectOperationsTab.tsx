
import { Operation } from "@/features/operations/types";
import { OperationsDesktopTable } from "./all-operations/OperationsDesktopTable";
import { OperationsMobileList } from "./all-operations/OperationsMobileList";
import { TotalsSection } from "./all-operations/TotalsSection";

interface DirectOperationsTabProps {
  operations: Operation[];
  currency: string;
  isPublicView?: boolean;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
}

export const DirectOperationsTab = ({ 
  operations, 
  currency,
  isPublicView = false,
  updateOperation,
  onOperationDeleted
}: DirectOperationsTabProps) => {
  return (
    <div className="space-y-4">
      <TotalsSection operations={operations} currency={currency} />
      <OperationsDesktopTable 
        operations={operations} 
        currency={currency}
        isPublicView={isPublicView}
        updateOperation={updateOperation}
        onOperationDeleted={onOperationDeleted}
      />
      <OperationsMobileList 
        operations={operations} 
        currency={currency}
        isPublicView={isPublicView}
        updateOperation={updateOperation}
        onOperationDeleted={onOperationDeleted}
      />
    </div>
  );
};
