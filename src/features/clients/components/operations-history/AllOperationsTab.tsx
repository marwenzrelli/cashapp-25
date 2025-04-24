
import React from "react";
import { Operation } from "@/features/operations/types";
import { OperationsDesktopTable } from "./all-operations/OperationsDesktopTable";
import { OperationsMobileList } from "./all-operations/OperationsMobileList";
import { useIsMobile } from "@/hooks/use-mobile";

interface AllOperationsTabProps {
  operations: Operation[];
  currency?: string;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
}

export const AllOperationsTab = ({ 
  operations, 
  currency = "TND",
  updateOperation,
  onOperationDeleted
}: AllOperationsTabProps) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <OperationsMobileList 
      operations={operations}
      currency={currency} 
      updateOperation={updateOperation}
      onOperationDeleted={onOperationDeleted}
    />
  ) : (
    <OperationsDesktopTable 
      operations={operations} 
      currency={currency}
      updateOperation={updateOperation}
      onOperationDeleted={onOperationDeleted}
    />
  );
};
