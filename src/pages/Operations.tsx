
import { useState, useEffect } from "react";
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

  // Fetch operations on initial load
  useEffect(() => {
    if (!initialLoadAttempted) {
      console.log("Initial operations fetch");
      fetchOperations(true);
      setInitialLoadAttempted(true);
    }
  }, [fetchOperations, initialLoadAttempted]);

  // Filter operations with loading state
  const filteredOperations = operations.filter((op) => {
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

  // Handle manual refresh
  const handleManualRefresh = () => {
    console.log("Manual refresh triggered");
    refreshOperations();
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

      {isLoading && operations.length === 0 && (
        <div className="py-12 flex justify-center">
          <LoadingIndicator 
            text="Chargement des opérations..." 
            size="lg" 
            showImmediately={true}
          />
        </div>
      )}

      {!isLoading && error && (
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

      {!isLoading && !error && operations.length === 0 && initialLoadAttempted && (
        <div className="rounded-lg bg-gray-50 p-6 text-center">
          <p className="text-muted-foreground">
            Aucune opération trouvée. Créez des versements, retraits ou virements pour les voir ici.
          </p>
        </div>
      )}

      {(operations.length > 0 || isLoading) && (
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
