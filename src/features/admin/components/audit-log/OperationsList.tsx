
import React from "react";
import { LogEntryRenderer, OperationLogEntry } from "./LogEntryRenderer";

interface OperationsListProps {
  operations: OperationLogEntry[];
}

export const OperationsList: React.FC<OperationsListProps> = ({ operations }) => {
  if (operations.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Aucune opération supprimée trouvée.
      </div>
    );
  }

  return (
    <>
      {operations.map((entry, index) => (
        <LogEntryRenderer 
          key={`${entry.type}-${entry.id}`} 
          entry={entry} 
          index={index} 
          type="operation" 
        />
      ))}
    </>
  );
};
