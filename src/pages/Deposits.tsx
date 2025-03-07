
import { DepositsContent } from "@/features/deposits/components/DepositsContent";
import { useDepositsPage } from "@/features/deposits/hooks/useDepositsPage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OperationActionsDialog } from "@/features/clients/components/operations-history/OperationActionsDialog";
import { Operation } from "@/features/operations/types";

const Deposits = () => {
  const {
    searchTerm, 
    setSearchTerm,
    isDialogOpen, 
    setIsDialogOpen,
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen,
    isEditDialogOpen, 
    setIsEditDialogOpen,
    selectedDeposit,
    itemsPerPage, 
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    editForm,
    deposits,
    paginatedDeposits,
    filteredDeposits,
    handleDelete,
    confirmDelete,
    handleEdit,
    handleEditFormChange,
    handleConfirmEdit,
    handleCreateDeposit,
    fetchDeposits,
    isLoading,
    isDeleting,
    totalItems
  } = useDepositsPage();

  // Add state for the new operation dialog
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isOperationEditDialogOpen, setIsOperationEditDialogOpen] = useState(false);
  const [isOperationDeleteDialogOpen, setIsOperationDeleteDialogOpen] = useState(false);

  // Track authentication state and fetch deposits when auth changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Initial fetch
    fetchDeposits();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchDeposits();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handlers for the new operation dialog
  const handleEditOperation = (deposit: any) => {
    // Convert deposit to Operation format
    const operation: Operation = {
      id: deposit.id,
      amount: deposit.amount,
      date: deposit.operation_date || deposit.created_at,
      type: "deposit",
      fromClient: deposit.client_name,
      description: deposit.notes || "",
    };
    
    setSelectedOperation(operation);
    setIsOperationEditDialogOpen(true);
  };

  const handleDeleteOperation = (deposit: any) => {
    // Convert deposit to Operation format
    const operation: Operation = {
      id: deposit.id,
      amount: deposit.amount,
      date: deposit.operation_date || deposit.created_at,
      type: "deposit",
      fromClient: deposit.client_name,
      description: deposit.notes || "",
    };
    
    setSelectedOperation(operation);
    setIsOperationDeleteDialogOpen(true);
  };

  const handleCloseOperationDialog = () => {
    setIsOperationEditDialogOpen(false);
    setIsOperationDeleteDialogOpen(false);
    setSelectedOperation(null);
    fetchDeposits(); // Refresh data
  };

  console.log("Deposits page render - deposits count:", deposits?.length);
  console.log("Deposits page render - filtered deposits count:", filteredDeposits?.length);
  console.log("Deposits page render - paginated deposits count:", paginatedDeposits?.length);
  console.log("Deposits page render - isLoading:", isLoading);
  
  return (
    <>
      <DepositsContent
        deposits={deposits}
        filteredDeposits={filteredDeposits}
        paginatedDeposits={paginatedDeposits}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        selectedDeposit={selectedDeposit}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        editForm={editForm}
        handleDelete={handleDeleteOperation} // Use the new handler
        confirmDelete={confirmDelete}
        handleEdit={handleEditOperation} // Use the new handler
        handleEditFormChange={handleEditFormChange}
        handleConfirmEdit={handleConfirmEdit}
        handleCreateDeposit={handleCreateDeposit}
        isLoading={isLoading}
        totalItems={totalItems}
      />
      
      {/* New Operation Edit Dialog */}
      <OperationActionsDialog
        operation={selectedOperation}
        isOpen={isOperationEditDialogOpen}
        onClose={handleCloseOperationDialog}
        refetchClient={fetchDeposits}
        mode="edit"
      />
      
      {/* New Operation Delete Dialog */}
      <OperationActionsDialog
        operation={selectedOperation}
        isOpen={isOperationDeleteDialogOpen}
        onClose={handleCloseOperationDialog}
        refetchClient={fetchDeposits}
        mode="delete"
      />
    </>
  );
};

export default Deposits;
