
import { useState, useEffect, useRef } from "react";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { DateRange } from "react-day-picker";
import { formatDateTime } from "@/features/operations/types";
import { Operation } from "@/features/operations/types";
import { OperationsList } from "@/features/operations/components/OperationsList";
import { OperationsHeader } from "@/features/operations/components/OperationsHeader";
import { generatePDF } from "@/features/operations/utils/pdf-generator";
import { operationMatchesSearch } from "@/features/operations/utils/display-helpers";
import { TransferPagination } from "@/features/transfers/components/TransferPagination";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Info } from "lucide-react";

const Operations = () => {
  const { 
    operations, 
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
  
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltering, setIsFiltering] = useState(false);
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
      (!isLoading && operations.length > 0) ||
      (manualRefreshClickedRef.current && !isLoading) ||
      (forcedRefresh && !isLoading);
    
    if (shouldUpdateStableOperations) {
      console.log(`Updating stable operations with ${operations.length} operations`);
      setStableOperations(operations);
      manualRefreshClickedRef.current = false;
      setLoadingTimeout(false);
    }
  }, [operations, isLoading, forcedRefresh]);

  // Filter stable operations (not real-time changing operations)
  const filteredOperations = stableOperations.filter((op) => {
    // Filter by type
    const matchesType = !filterType || op.type === filterType;
    
    // Use improved function for client search
    const matchesClient = operationMatchesSearch(op, filterClient);
    
    // Date filtering
    const matchesDate =
      (!dateRange?.from ||
        new Date(op.operation_date || op.date) >= new Date(dateRange.from)) &&
      (!dateRange?.to ||
        new Date(op.operation_date || op.date) <= new Date(dateRange.to));
    
    return matchesType && matchesClient && matchesDate;
  });

  // Reset filtering state after a brief delay
  useEffect(() => {
    setIsFiltering(true);
    const timeout = setTimeout(() => {
      setIsFiltering(false);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [filterType, filterClient, dateRange]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterClient, dateRange, itemsPerPage]);

  // Format dates for display
  const operationsWithFormattedDates = filteredOperations.map(op => ({
    ...op,
    formattedDate: formatDateTime(op.operation_date || op.date)
  }));

  // Pagination of operations
  const paginatedOperations = operationsWithFormattedDates.slice(
    (currentPage - 1) * parseInt(itemsPerPage),
    currentPage * parseInt(itemsPerPage)
  );

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
        <div className="py-12 flex flex-col items-center justify-center">
          <LoadingIndicator 
            text={`Chargement des opérations... ${loadingDuration > 3 ? `(${loadingDuration}s)` : ''}`}
            size="lg" 
            showImmediately={true}
          />
          
          {loadingDuration > 5 && (
            <Button 
              onClick={handleForceRefresh}
              variant="outline"
              className="mt-6"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Force l'actualisation
            </Button>
          )}
          
          {showNetworkError && (
            <div className="mt-6 max-w-md p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-700 mb-2">
                Le chargement prend plus de temps que prévu.
              </p>
              <p className="text-xs text-yellow-600">
                Vérifiez votre connexion réseau ou essayez de rafraîchir la page.
              </p>
            </div>
          )}
        </div>
      )}
      
      {showLoadingTimeout && (
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
          <p className="text-yellow-700 mb-4">
            Le chargement des opérations prend plus de temps que prévu.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button 
              onClick={handleForceRefresh}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Forcer l'actualisation
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </Button>
          </div>
        </div>
      )}

      {showError && (
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-600 mb-2">
            Erreur lors du chargement des opérations.
          </p>
          <p className="text-sm text-red-500 mb-4">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button 
              onClick={handleManualRefresh}
              variant="destructive"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </Button>
          </div>
        </div>
      )}

      {showEmptyState && (
        <div className="rounded-lg bg-gray-50 p-6 text-center">
          <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-muted-foreground">
            Aucune opération trouvée. Créez des versements, retraits ou virements pour les voir ici.
          </p>
        </div>
      )}

      {showContent && (
        <>
          <TransferPagination
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            totalItems={filteredOperations.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            label="opérations"
          />

          <OperationsList 
            operations={paginatedOperations} 
            isLoading={isLoading || isFiltering} 
            onDelete={deleteOperation} 
          />
          
          {isLoading && stableOperations.length > 0 && (
            <div className="py-2 flex justify-center">
              <LoadingIndicator 
                text="Actualisation..." 
                size="sm" 
                fadeIn={true}
                showImmediately={false}
                debounceMs={500}
              />
            </div>
          )}
        </>
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
