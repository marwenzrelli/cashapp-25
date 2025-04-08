
import { useState, useEffect } from "react";
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
import { OperationsLoading } from "@/features/operations/components/OperationsLoading";

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

  const [loadingDuration, setLoadingDuration] = useState(0);
  const [showNetworkError, setShowNetworkError] = useState(false);
  
  // Compteur pour afficher la durée de chargement
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let counter = 0;
    
    if (isLoading) {
      timer = setInterval(() => {
        counter += 1;
        setLoadingDuration(counter);
        
        // Afficher un message réseau après 10 secondes
        if (counter >= 10 && !showNetworkError) {
          setShowNetworkError(true);
        }
      }, 1000);
    } else {
      setLoadingDuration(0);
      setShowNetworkError(false);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, showNetworkError]);

  const handleExportPDF = () => {
    generatePDF(filteredOperations, filterType, filterClient, dateRange);
  };

  return (
    <div className="space-y-6">
      <OperationsHeader 
        onExportPDF={handleExportPDF} 
        onPrint={() => window.print()}
        onRefresh={() => refreshOperations(true)}
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
        <OperationsLoading 
          loadingDuration={loadingDuration}
          showNetworkError={showNetworkError}
          onForceRefresh={() => refreshOperations(true)}
        />
      )}
      
      {error && !isLoading && (
        <OperationsError 
          error={error} 
          onRetry={() => refreshOperations(true)} 
        />
      )}

      {!isLoading && !error && allOperations.length === 0 && (
        <OperationsEmptyState onRefresh={() => refreshOperations(true)} />
      )}

      {(filteredOperations.length > 0 || !isLoading) && (
        <OperationsContent
          filteredOperations={filteredOperations}
          isLoading={isLoading}
          isFiltering={filterType !== "all" || !!filterClient || !!dateRange}
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
