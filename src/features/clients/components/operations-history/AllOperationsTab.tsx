
import { Operation } from "@/features/operations/types";
import { OperationsDesktopTable } from "./all-operations/OperationsDesktopTable";
import { OperationsMobileList } from "./all-operations/OperationsMobileList";
import { TotalsSection } from "./all-operations/TotalsSection";

interface AllOperationsTabProps {
  operations: Operation[];
  currency: string;
  isPublicView?: boolean;
  clientName?: string;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
}

export const AllOperationsTab = ({ 
  operations, 
  currency,
  isPublicView = false,
  clientName,
  updateOperation,
  onOperationDeleted
}: AllOperationsTabProps) => {
  return (
    <div className="space-y-4">
      <TotalsSection operations={operations} currency={currency} clientName={clientName} />
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
