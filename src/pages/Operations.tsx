
import React from "react";
import { OperationsContent } from "@/features/operations/components/OperationsContent";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { OperationsError } from "@/features/operations/components/OperationsError";

const Operations = () => {
  const {
    operations,
    isLoading,
    error,
    refreshOperations,
    deleteOperation,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteOperation,
    operationToDelete
  } = useOperations();

  if (isLoading && operations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingIndicator 
          text="Chargement des opérations..." 
          size="lg"
        />
      </div>
    );
  }

  if (error && operations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OperationsError 
          error={error} 
          onRetry={() => refreshOperations(true)} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OperationsContent
        operations={operations}
        isLoading={isLoading}
        error={error}
        onRefresh={() => refreshOperations(true)}
        onDelete={deleteOperation}
        showDeleteDialog={showDeleteDialog}
        onDeleteDialogClose={() => setShowDeleteDialog(false)}
        onConfirmDelete={confirmDeleteOperation}
        operationToDelete={operationToDelete}
      />
    </div>
  );
};

export default Operations;
