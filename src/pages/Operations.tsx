
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
import { RefreshCw } from "lucide-react";

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
  const lastRefreshTimeRef = useRef<number>(Date.now());
  const manualRefreshClickedRef = useRef<boolean>(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch operations on initial load
  useEffect(() => {
    if (!initialLoadAttempted) {
      console.log("Initial operations fetch");
      fetchOperations(true);
      setInitialLoadAttempted(true);
      lastRefreshTimeRef.current = Date.now();
      
      // Set a loading timeout to detect stalled loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setLoadingTimeout(true);
        }
      }, 15000);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [fetchOperations, initialLoadAttempted, isLoading]);

  // Stabilisez les opérations pour éviter les clignotements
  useEffect(() => {
    // Après le chargement initial ou un rafraîchissement manuel, mettre à jour les opérations stables
    const shouldUpdateStableOperations = 
      (!isLoading && operations.length > 0) ||
      (manualRefreshClickedRef.current && !isLoading);
    
    if (shouldUpdateStableOperations) {
      console.log(`Updating stable operations with ${operations.length} operations`);
      setStableOperations(operations);
      manualRefreshClickedRef.current = false;
      setLoadingTimeout(false);
    }
  }, [operations, isLoading]);

  // Filtrer les opérations stables (pas les opérations qui changent en temps réel)
  const filteredOperations = stableOperations.filter((op) => {
    // Filtrage par type
    const matchesType = !filterType || op.type === filterType;
    
    // Utiliser la fonction améliorée pour la recherche de client
    const matchesClient = operationMatchesSearch(op, filterClient);
    
    // Filtrage par date
    const matchesDate =
      (!dateRange?.from ||
        new Date(op.operation_date || op.date) >= new Date(dateRange.from)) &&
      (!dateRange?.to ||
        new Date(op.operation_date || op.date) <= new Date(dateRange.to));
    
    return matchesType && matchesClient && matchesDate;
  });

  // Reset the filtering state after a brief delay
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

  // Pagination des opérations
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
    
    // Limiter les rafraîchissements manuels à un toutes les 3 secondes
    if (timeSinceLastRefresh < 3000) {
      toast.info(`Attendez ${Math.ceil((3000 - timeSinceLastRefresh) / 1000)} secondes avant de rafraîchir à nouveau`);
      return;
    }
    
    console.log("Manual refresh triggered");
    manualRefreshClickedRef.current = true;
    lastRefreshTimeRef.current = now;
    setLoadingTimeout(false);
    refreshOperations();
  };

  // Fonction de récupération forcée en cas de timeout
  const handleForceRefresh = () => {
    console.log("Force refresh triggered");
    manualRefreshClickedRef.current = true;
    lastRefreshTimeRef.current = Date.now();
    setLoadingTimeout(false);
    
    // Forcer une actualisation complète
    fetchOperations(true);
  };

  // Déterminer si nous devons afficher un chargement, une erreur ou le contenu
  const showInitialLoading = isLoading && stableOperations.length === 0 && !loadingTimeout;
  const showLoggingTimeout = loadingTimeout && stableOperations.length === 0;
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
        <div className="py-12 flex justify-center">
          <LoadingIndicator 
            text="Chargement des opérations..." 
            size="lg" 
            showImmediately={true}
          />
        </div>
      )}
      
      {showLoggingTimeout && (
        <div className="rounded-lg bg-yellow-50 p-6 text-center">
          <p className="text-yellow-700 mb-4">
            Le chargement des opérations prend plus de temps que prévu.
          </p>
          <Button 
            onClick={handleForceRefresh}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Forcer l'actualisation
          </Button>
        </div>
      )}

      {showError && (
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-600">
            Erreur lors du chargement des opérations. Veuillez rafraîchir la page.
          </p>
          <button 
            onClick={handleManualRefresh}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {showEmptyState && (
        <div className="rounded-lg bg-gray-50 p-6 text-center">
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
