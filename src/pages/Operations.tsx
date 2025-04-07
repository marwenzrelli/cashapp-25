
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
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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
    refreshOperations,
    setUseMockData
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

  const [showMockDataOption, setShowMockDataOption] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    console.log(`Operations page - Total operations: ${allOperations.length}`);
    console.log(`Operations page - Filtered operations: ${filteredOperations.length}`);
  }, [allOperations.length, filteredOperations.length]);

  // Show mock data option after extended loading or multiple errors
  useEffect(() => {
    if (loadingDuration > 15 || (error && !showMockDataOption)) {
      setShowMockDataOption(true);
    }
  }, [loadingDuration, error, showMockDataOption]);

  const handleExportPDF = () => {
    generatePDF(filteredOperations, filterType, filterClient, dateRange);
  };

  const enableMockData = () => {
    setUseMockData(true);
    setUsingMockData(true);
    toast.success("Données de démonstration activées");
    handleForceRefresh();
  };

  return (
    <div className="space-y-6">
      <OperationsHeader 
        onExportPDF={handleExportPDF} 
        onPrint={() => window.print()}
        onRefresh={handleManualRefresh}
      />

      {usingMockData && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              Vous utilisez des données de démonstration. Ces opérations ne sont pas réelles.
            </p>
          </CardContent>
        </Card>
      )}

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
          showMockDataOption={showMockDataOption && !usingMockData}
          onUseMockData={enableMockData}
        />
      )}
      
      {showLoadingTimeout && (
        <OperationsLoadingTimeout 
          onForceRefresh={handleForceRefresh} 
          showMockDataOption={showMockDataOption && !usingMockData}
          onUseMockData={enableMockData}
        />
      )}

      {showError && (
        <OperationsError 
          error={error} 
          onRetry={handleManualRefresh} 
          showMockDataOption={showMockDataOption && !usingMockData}
          onUseMockData={enableMockData}
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
