
import React from "react";
import { TreasuryTable } from "./TreasuryTable";
import { Operation } from "@/features/operations/types";

interface TreasuryTabProps {
  operations: Operation[];
  isLoading: boolean;
}

export const TreasuryTab = ({ operations, isLoading }: TreasuryTabProps) => {
  const [localOperations, setLocalOperations] = React.useState<Operation[]>(operations);

  // Mettre à jour les opérations locales quand les props changent
  React.useEffect(() => {
    setLocalOperations(operations);
  }, [operations]);

  const handleDataRefresh = (newOperations: Operation[]) => {
    setLocalOperations(newOperations);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement des données de trésorerie...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TreasuryTable 
        operations={localOperations} 
        onDataRefresh={handleDataRefresh}
      />
    </div>
  );
};
