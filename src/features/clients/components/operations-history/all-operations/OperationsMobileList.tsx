
import React from "react";
import { Operation } from "@/features/operations/types";
import { OperationsMobileCard } from "../OperationsMobileCard";

interface OperationsMobileListProps {
  operations: Operation[];
  currency: string;
  isPublicView?: boolean;
  updateOperation?: (operation: Operation) => Promise<void>;
  onOperationDeleted?: () => Promise<void>;
}

export const OperationsMobileList = ({ 
  operations, 
  currency,
  isPublicView = false,
  updateOperation,
  onOperationDeleted
}: OperationsMobileListProps) => {
  if (operations.length === 0) {
    return (
      <div className="md:hidden text-center py-8 text-muted-foreground">
        Aucune opération trouvée
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-4 p-4">
      {operations.map((operation) => (
        <OperationsMobileCard 
          key={operation.id} 
          operation={operation} 
          currency={currency}
          isPublicView={isPublicView}
          updateOperation={updateOperation}
          onOperationDeleted={onOperationDeleted}
        />
      ))}
    </div>
  );
};
