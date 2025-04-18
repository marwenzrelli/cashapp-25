
import React from "react";
import { Operation } from "@/features/operations/types";
import { EmptyOperations } from "./EmptyOperations";
import { OperationsDesktopTable } from "./all-operations/OperationsDesktopTable";
import { OperationsMobileList } from "./all-operations/OperationsMobileList";
import { useIsMobile } from "@/hooks/use-mobile";

interface AllOperationsTabProps {
  operations: Operation[];
  currency?: string;
  updateOperation?: (operation: Operation) => Promise<void>;
}

export const AllOperationsTab = ({ 
  operations, 
  currency = "TND",
  updateOperation
}: AllOperationsTabProps) => {
  const isMobile = useIsMobile();
  
  if (operations.length === 0) {
    return <EmptyOperations />;
  }

  return (
    <>
      {/* Desktop version - hidden on mobile */}
      <div className="hidden md:block">
        <OperationsDesktopTable 
          operations={operations}
          currency={currency}
          updateOperation={updateOperation}
        />
      </div>

      {/* Mobile version - only shown on mobile */}
      {isMobile && (
        <div className="py-1 px-2">
          <OperationsMobileList 
            operations={operations}
            currency={currency}
            updateOperation={updateOperation}
          />
        </div>
      )}
    </>
  );
};
