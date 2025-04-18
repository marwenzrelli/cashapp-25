
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
import { EditOperationDialog } from "@/features/operations/components/EditOperationDialog";
import { Operation } from "@/features/operations/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [operationToEdit, setOperationToEdit] = useState<Operation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Log operation counts to verify all are being loaded
  useEffect(() => {
    if (allOperations.length > 0) {
      console.log(`Total operations loaded: ${allOperations.length}`);
      console.log(`Deposits: ${allOperations.filter(op => op.type === 'deposit').length}`);
      console.log(`Withdrawals: ${allOperations.filter(op => op.type === 'withdrawal').length}`);
      console.log(`Transfers: ${allOperations.filter(op => op.type === 'transfer').length}`);
    }
  }, [allOperations]);
  
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

  // Function to handle editing an operation
  const handleEdit = (operation: Operation) => {
    console.log("Edit operation:", operation);
    setOperationToEdit(operation);
    setEditDialogOpen(true);
  };
  
  // Function to update an operation
  const handleUpdateOperation = async (updatedOperation: Operation) => {
    if (!updatedOperation) return;
    
    setIsUpdating(true);
    try {
      console.log("Updating operation:", updatedOperation);
      
      const operationType = updatedOperation.type;
      const operationIdString = updatedOperation.id.split('-')[1]; // Extract the ID part
      const operationId = parseInt(operationIdString, 10);
      
      if (isNaN(operationId)) {
        console.error("Invalid operation ID:", operationIdString);
        toast.error("Format d'ID invalide");
        return;
      }
      
      let error = null;
      
      // Update based on operation type
      if (operationType === 'deposit') {
        const { error: updateError } = await supabase
          .from('deposits')
          .update({
            client_name: updatedOperation.fromClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            notes: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      } else if (operationType === 'withdrawal') {
        const { error: updateError } = await supabase
          .from('withdrawals')
          .update({
            client_name: updatedOperation.fromClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            notes: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      } else if (operationType === 'transfer') {
        const { error: updateError } = await supabase
          .from('transfers')
          .update({
            from_client: updatedOperation.fromClient,
            to_client: updatedOperation.toClient,
            amount: updatedOperation.amount,
            operation_date: updatedOperation.operation_date,
            reason: updatedOperation.description,
            last_modified_at: new Date().toISOString()
          })
          .eq('id', operationId);
        error = updateError;
      }
      
      if (error) {
        console.error("Error updating operation:", error);
        toast.error("Erreur lors de la mise à jour");
        return;
      }
      
      toast.success("Opération mise à jour avec succès");
      refreshOperations(true);
    } catch (error) {
      console.error("Error updating operation:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  // Force refresh on initial load
  useEffect(() => {
    refreshOperations(true);
  }, [refreshOperations]);

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
          isFiltering={filterType !== null || !!filterClient || !!(dateRange?.from && dateRange?.to)}
          onDelete={deleteOperation}
          onEdit={handleEdit}
        />
      )}
      
      <DeleteOperationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={() => confirmDeleteOperation()}
        operation={operationToDelete}
      />
      
      <EditOperationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        operation={operationToEdit}
        onConfirm={handleUpdateOperation}
      />
    </div>
  );
};

export default Operations;
