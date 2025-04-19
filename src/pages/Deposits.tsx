
import { DepositsContent } from "@/features/deposits/components/DepositsContent";
import { useDepositsPage } from "@/features/deposits/hooks/useDepositsPage";
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    dateRange,
    setDateRange,
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

  // Memoize the fetchDeposits function to prevent re-renders
  const memoizedFetchDeposits = useCallback(() => {
    console.log("Memoized fetch deposits called");
    fetchDeposits();
  }, [fetchDeposits]);

  // Track authentication state and fetch deposits when auth changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Initial fetch
    memoizedFetchDeposits();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        memoizedFetchDeposits();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [memoizedFetchDeposits]);

  // Debugging logs wrapped in a stable useEffect to prevent continuous logging
  useEffect(() => {
    console.log("Deposits page render - deposits count:", deposits?.length);
    console.log("Deposits page render - filtered deposits count:", filteredDeposits?.length);
    console.log("Deposits page render - paginated deposits count:", paginatedDeposits?.length);
  }, [deposits?.length, filteredDeposits?.length, paginatedDeposits?.length]);
  
  return (
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
      dateRange={dateRange}
      setDateRange={setDateRange}
      editForm={editForm}
      handleDelete={handleDelete}
      confirmDelete={confirmDelete}
      handleEdit={handleEdit}
      handleEditFormChange={handleEditFormChange}
      handleConfirmEdit={handleConfirmEdit}
      handleCreateDeposit={handleCreateDeposit}
      isLoading={isLoading}
      totalItems={totalItems}
    />
  );
};

export default Deposits;
