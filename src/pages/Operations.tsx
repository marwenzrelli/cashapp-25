
import { useState } from "react";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { OperationsHeader } from "@/features/operations/components/OperationsHeader";
import { generatePDF } from "@/features/operations/utils/pdf-generator";
import { useOperationsFilter } from "@/features/operations/hooks/useOperationsFilter";
import { OperationsLoadingTimeout } from "@/features/operations/components/OperationsLoadingTimeout";
import { OperationsError } from "@/features/operations/components/OperationsError";
import { OperationsEmptyState } from "@/features/operations/components/OperationsEmptyState";
import { OperationsContent } from "@/features/operations/components/OperationsContent";

const Operations = () => {
  const { 
    operations: allOperations, 
    isLoading, 
    error,
    deleteOperation, 
    showDeleteDialog, 
    setShowDeleteDialog, 
    confirmDeleteOperation,
    operationToDelete,
    refreshOperations
  } = useOperations();
  
  const {
    filterType,
    setFilterType,
    filterClient,
    setFilterClient,
    dateRange,
    setDateRange,
    filteredOperations
  } = useOperationsFilter(allOperations);

  const showError = Boolean(error);
  const showEmptyState = !isLoading && !error && allOperations.length === 0;
  const showContent = !isLoading || filteredOperations.length > 0;

  const handleExportPDF = () => {
    generatePDF(filteredOperations, filterType, filterClient, dateRange);
  };

  return (
    <div className="space-y-6">
      <OperationsHeader 
        onExportPDF={handleExportPDF} 
        onPrint={() => window.print()}
        onRefresh={refreshOperations}
      />

      <OperationFilters
        type={filterType}
        setType={setFilterType}
        client={filterClient}
        setClient={setFilterClient}
        date={dateRange}
        setDate={setDateRange}
      />

      {isLoading && filteredOperations.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-primary/10 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-primary/10 rounded mb-2"></div>
            <div className="h-3 w-32 bg-primary/5 rounded"></div>
          </div>
        </div>
      )}
      
      {showError && (
        <OperationsError 
          error={error} 
          onRetry={refreshOperations} 
        />
      )}

      {showEmptyState && (
        <OperationsEmptyState onRefresh={refreshOperations} />
      )}

      {showContent && (
        <OperationsContent
          filteredOperations={filteredOperations}
          isLoading={isLoading}
          isFiltering={false}
          onDelete={deleteOperation}
        />
      )}
      
      <DeleteOperationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={() => confirmDeleteOperation()}
        operation={operationToDelete}
      />
    </div>
  );
};

export default Operations;
