
import React from "react";
import { Operation } from "@/features/operations/types";
import { EmptyOperations } from "./EmptyOperations";
import { OperationsDesktopTable } from "./all-operations/OperationsDesktopTable";
import { OperationsMobileList } from "./all-operations/OperationsMobileList";

interface AllOperationsTabProps {
  operations: Operation[];
  currency?: string;
}

export const AllOperationsTab = ({ 
  operations, 
  currency = "TND"
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
      />

      {/* Mobile version */}
      <OperationsMobileList 
        operations={operations}
        currency={currency}
      />
    </>
  );
};
