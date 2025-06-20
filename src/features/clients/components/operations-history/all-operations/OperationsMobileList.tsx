
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
      <div className="md:hidden text-center py-12 px-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/30">
          <p className="text-muted-foreground text-base">Aucune opération trouvée</p>
          <p className="text-xs text-muted-foreground/70 mt-2">Essayez d'ajuster vos filtres de recherche</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3 p-4">
      <div className="text-xs text-muted-foreground mb-3 text-center bg-primary/5 dark:bg-primary/10 px-3 py-2 rounded-lg">
        {operations.length} opération{operations.length > 1 ? 's' : ''} trouvée{operations.length > 1 ? 's' : ''}
      </div>
      
      {operations.map((operation) => (
        <OperationsMobileCard 
          key={operation.id} 
          operation={operation} 
          currency={currency}
          isPublicView={isPublicView}
          updateOperation={updateOperation}
          onOperationDeleted={onOperationDeleted}
          showId={true}
          showType={true}
        />
      ))}
    </div>
  );
};
