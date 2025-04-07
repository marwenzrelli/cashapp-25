import { useState, useEffect } from "react";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { OperationsHeader } from "@/features/operations/components/OperationsHeader";
import { generatePDF } from "@/features/operations/utils/pdf-generator";
import { useOperationsFilter } from "@/features/operations/hooks/useOperationsFilter";
import { OperationsLoading } from "@/features/operations/components/OperationsLoading";
import { OperationsLoadingTimeout } from "@/features/operations/components/OperationsLoadingTimeout";
import { OperationsError } from "@/features/operations/components/OperationsError";
import { OperationsEmptyState } from "@/features/operations/components/OperationsEmptyState";
import { OperationsContent } from "@/features/operations/components/OperationsContent";
import { Operation } from "@/features/operations/types";
import { useOperationsLoadingState } from "@/features/operations/hooks/useOperationsLoadingState";

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
    fetchOperations,
    refreshOperations
  } = useOperations();
  
  const {
    filterType,
    setFilterType,
    filterClient,
    setFilterClient,
    dateRange,
    setDateRange,
    isFiltering,
    filteredOperations
  } = useOperationsFilter(allOperations);

  const {
    loadingDuration,
    loadingTimeout,
    showNetworkError,
    showInitialLoading,
    showLoadingTimeout,
    showError,
    showEmptyState,
    showContent,
    handleForceRefresh,
    handleManualRefresh
  } = useOperationsLoadingState({
    isLoading,
    error,
    operations: allOperations,
    fetchOperations
  });

  useEffect(() => {
    console.log(`Operations page - Total operations: ${allOperations.length}`);
    console.log(`Operations page - Filtered operations: ${filteredOperations.length}`);
  }, [allOperations.length, filteredOperations.length]);

  const handleExportPDF = () => {
    generatePDF(filteredOperations, filterType, filterClient, dateRange);
  };

  return (
    <div className="space-y-6">
      <OperationsHeader 
        onExportPDF={handleExportPDF} 
        onPrint={() => window.print()}
        onRefresh={handleManualRefresh}
      />

      <OperationFilters
        type={filterType}
        setType={setFilterType}
        client={filterClient}
        setClient={setFilterClient}
        date={dateRange}
        setDate={setDateRange}
      />

      {showInitialLoading && (
        <OperationsLoading 
          loadingDuration={loadingDuration}
          showNetworkError={showNetworkError}
          onForceRefresh={handleForceRefresh}
        />
      )}
      
      {showLoadingTimeout && (
        <OperationsLoadingTimeout onForceRefresh={handleForceRefresh} />
      )}

      {showError && (
        <OperationsError 
          error={error} 
          onRetry={handleManualRefresh} 
        />
      )}

      {showEmptyState && (
        <OperationsEmptyState onRefresh={handleManualRefresh} />
      )}

      {showContent && (
        <OperationsContent
          filteredOperations={filteredOperations}
          isLoading={isLoading}
          isFiltering={isFiltering}
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
