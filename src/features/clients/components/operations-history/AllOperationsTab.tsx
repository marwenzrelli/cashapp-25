
import React from "react";
import { Operation } from "@/features/operations/types";
import { EmptyOperations } from "./EmptyOperations";
import { OperationsDesktopTable } from "./all-operations/OperationsDesktopTable";
import { OperationsMobileList } from "./all-operations/OperationsMobileList";

interface AllOperationsTabProps {
  operations: Operation[];
  currency?: string;
  selectedOperations?: Record<string, boolean>;
  toggleSelection?: (id: string) => void;
}

export const AllOperationsTab = ({ 
  operations, 
  currency = "TND",
  selectedOperations = {},
  toggleSelection = () => {}
}: AllOperationsTabProps) => {
  if (operations.length === 0) {
    return <EmptyOperations />;
  }

  return (
    <>
      {/* Desktop version */}
      <OperationsDesktopTable 
        operations={operations}
        currency={currency}
        selectedOperations={selectedOperations}
        toggleSelection={toggleSelection}
      />

      {/* Mobile version */}
      <OperationsMobileList 
        operations={operations}
        currency={currency}
        selectedOperations={selectedOperations}
        toggleSelection={toggleSelection}
      />
    </>
  );
};
