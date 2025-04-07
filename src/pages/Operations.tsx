import { useState, useEffect, useRef } from "react";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { OperationsHeader } from "@/features/operations/components/OperationsHeader";
import { generatePDF } from "@/features/operations/utils/pdf-generator";
import { toast } from "sonner";
import { useOperationsFilter } from "@/features/operations/hooks/useOperationsFilter";
import { OperationsLoading } from "@/features/operations/components/OperationsLoading";
import { OperationsLoadingTimeout } from "@/features/operations/components/OperationsLoadingTimeout";
import { OperationsError } from "@/features/operations/components/OperationsError";
import { OperationsEmptyState } from "@/features/operations/components/OperationsEmptyState";
import { OperationsContent } from "@/features/operations/components/OperationsContent";
import { Operation } from "@/features/operations/types"; // Added the missing import

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

  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const [stableOperations, setStableOperations] = useState<Operation[]>([]);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingDuration, setLoadingDuration] = useState(0);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [forcedRefresh, setForcedRefresh] = useState(false);
  
  const lastRefreshTimeRef = useRef<number>(Date.now());
  const manualRefreshClickedRef = useRef<boolean>(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number>(0);
  const initialFetchAttemptRef = useRef<number>(0);

  // Fetch operations on initial load
  useEffect(() => {
    if (!initialLoadAttempted) {
      console.log("Initial operations fetch");
      setInitialLoadAttempted(true);
      lastRefreshTimeRef.current = Date.now();
      loadingStartTimeRef.current = Date.now();
      
      // Attempt the initial fetch
      fetchOperations(true);
      
      // Set a loading timeout to detect stalled loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setLoadingTimeout(true);
        }
      }, 7000); // Reduced to 7s from 10s
      
      // Start a timer to show how long we've been loading
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
      
      loadingTimerRef.current = setInterval(() => {
        if (isLoading) {
          const duration = Math.floor((Date.now() - loadingStartTimeRef.current) / 1000);
          setLoadingDuration(duration);
          
          // After 15 seconds of loading, show network error suggestion
          if (duration > 15 && !showNetworkError) {
            setShowNetworkError(true);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
    };
  }, [fetchOperations, initialLoadAttempted, isLoading, showNetworkError]);

  // Auto-retry initial load if still loading after timeout
  useEffect(() => {
    if (isLoading && loadingTimeout && initialLoadAttempted && stableOperations.length === 0 && initialFetchAttemptRef.current < 2) {
      // Auto-retry the fetch, but only twice
      initialFetchAttemptRef.current += 1;
      console.log(`Auto-retrying initial fetch, attempt #${initialFetchAttemptRef.current}`);
      
      // Reset loading timeout 
      setLoadingTimeout(false);
      
      // Force a fresh fetch
      fetchOperations(true);
    }
  }, [fetchOperations, isLoading, loadingTimeout, initialLoadAttempted, stableOperations.length]);

  // Reset loading timer when loading state changes
  useEffect(() => {
    if (isLoading) {
      if (!loadingStartTimeRef.current) {
        loadingStartTimeRef.current = Date.now();
      }
    } else {
      loadingStartTimeRef.current = 0;
      setLoadingDuration(0);
      setShowNetworkError(false);
      
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      
      // Reset forced refresh state when loading completes
      if (forcedRefresh) {
        setForcedRefresh(false);
      }
    }
  }, [isLoading, forcedRefresh]);

  // Stabilize operations to avoid flicker
  useEffect(() => {
    // After initial load or manual refresh, update stable operations
    const shouldUpdateStableOperations = 
      (!isLoading && allOperations.length > 0) ||
      (manualRefreshClickedRef.current && !isLoading) ||
      (forcedRefresh && !isLoading);
    
    if (shouldUpdateStableOperations) {
      console.log(`Updating stable operations with ${allOperations.length} operations`);
      setStableOperations(allOperations);
      manualRefreshClickedRef.current = false;
      setLoadingTimeout(false);
    }
  }, [allOperations, isLoading, forcedRefresh]);

  // Export PDF functionality
  const handleExportPDF = () => {
    generatePDF(filteredOperations, filterType, filterClient, dateRange);
  };

  // Wrapper for confirmDeleteOperation to match the expected signature
  const handleDeleteOperation = async (id: string | number) => {
    await confirmDeleteOperation();
    return true; // Return true to indicate successful deletion
  };

  // Handle manual refresh with throttling
  const handleManualRefresh = () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    
    // Limit manual refreshes to one every 3 seconds
    if (timeSinceLastRefresh < 3000) {
      toast.info(`Attendez ${Math.ceil((3000 - timeSinceLastRefresh) / 1000)} secondes avant de rafraîchir à nouveau`);
      return;
    }
    
    console.log("Manual refresh triggered");
    manualRefreshClickedRef.current = true;
    lastRefreshTimeRef.current = now;
    setLoadingTimeout(false);
    setShowNetworkError(false);
    refreshOperations();
  };

  // Function for forced refresh in case of timeout
  const handleForceRefresh = () => {
    console.log("Force refresh triggered");
    manualRefreshClickedRef.current = true;
    lastRefreshTimeRef.current = Date.now();
    setLoadingTimeout(false);
    setShowNetworkError(false);
    setForcedRefresh(true);
    
    // Force discard previous request state
    fetchOperations(true);
  };

  // Determine if we should show loading, error, or content
  const showInitialLoading = isLoading && stableOperations.length === 0 && !loadingTimeout;
  const showLoadingTimeout = loadingTimeout && stableOperations.length === 0;
  const showError = !isLoading && error && stableOperations.length === 0;
  const showEmptyState = !isLoading && !error && stableOperations.length === 0 && initialLoadAttempted && !loadingTimeout;
  const showContent = stableOperations.length > 0 || isLoading;

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

      {showEmptyState && <OperationsEmptyState />}

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
        onDelete={handleDeleteOperation}
        operation={operationToDelete}
      />
    </div>
  );
};

export default Operations;
