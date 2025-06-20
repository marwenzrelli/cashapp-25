
import React from "react";
import { OperationsContent } from "@/features/operations/components/OperationsContent";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { useOperationsFilter } from "@/features/operations/hooks/useOperationsFilter";
import { OperationsFilters } from "@/features/operations/components/OperationsFilters";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { OperationsError } from "@/features/operations/components/OperationsError";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const {
    filterType,
    setFilterType,
    filterClient,
    setFilterClient,
    dateRange,
    setDateRange,
    clearAllFilters,
    isFiltering,
    filteredOperations
  } = useOperationsFilter(operations);

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
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Historique des Opérations</h1>
        <p className="text-muted-foreground">
          Consultez et filtrez toutes les opérations effectuées
        </p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <OperationsFilters
            type={filterType}
            setType={setFilterType}
            client={filterClient}
            setClient={setFilterClient}
            date={dateRange}
            setDate={setDateRange}
            isFiltering={isFiltering}
            onClearFilters={clearAllFilters}
            totalOperations={operations.length}
            filteredCount={filteredOperations.length}
          />
        </CardContent>
      </Card>

      {/* Operations Content */}
      <OperationsContent
        operations={filteredOperations}
        isLoading={isLoading}
        error={error}
        onRefresh={() => refreshOperations(true)}
        onDelete={deleteOperation}
        showDeleteDialog={showDeleteDialog}
        onDeleteDialogClose={() => setShowDeleteDialog(false)}
        onConfirmDelete={confirmDeleteOperation}
        operationToDelete={operationToDelete}
      />
      
      <ScrollToTop />
    </div>
  );
};

export default Operations;
