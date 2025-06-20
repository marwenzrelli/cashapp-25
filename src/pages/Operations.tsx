
import React, { useState } from "react";
import { OperationsContent } from "@/features/operations/components/OperationsContent";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { useOperationsFilter } from "@/features/operations/hooks/useOperationsFilter";
import { OperationsFilters } from "@/features/operations/components/OperationsFilters";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { OperationsError } from "@/features/operations/components/OperationsError";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const Operations = () => {
  const [showOperations, setShowOperations] = useState(false);
  
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

  const handleLoadOperations = () => {
    setShowOperations(true);
  };

  if (isLoading && operations.length === 0 && showOperations) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingIndicator 
          text="Chargement des opérations..." 
          size="lg"
        />
      </div>
    );
  }

  if (error && operations.length === 0 && showOperations) {
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

      {!showOperations ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/30">
              <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground text-base mb-4">Cliquez sur "Charger les opérations" pour afficher l'historique</p>
              <Button onClick={handleLoadOperations} size="lg">
                <Play className="h-4 w-4 mr-2" strokeWidth={2} />
                Charger les opérations
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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
        </>
      )}
      
      <ScrollToTop />
    </div>
  );
};

export default Operations;
