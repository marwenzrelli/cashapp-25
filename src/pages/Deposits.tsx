
import { DepositsContent } from "@/features/deposits/components/DepositsContent";
import { useDepositsPage } from "@/features/deposits/hooks/useDepositsPage";
import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Deposits = () => {
  // Track whether the auth listener was set up
  const authListenerSetup = useRef(false);
  
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
    fetchDeposits().catch(error => {
      console.error("Error fetching deposits:", error);
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les versements"
      });
    });
  }, [fetchDeposits]);

  // Set up auth listener only once and fetch deposits when auth changes
  useEffect(() => {
    if (authListenerSetup.current) return;
    authListenerSetup.current = true;
    
    console.log("Setting up auth state listener");
    
    // Initial fetch on mount
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

  // Debugging logs in a stable useEffect to prevent continuous logging
  useEffect(() => {
    console.log("Deposits page render - counts:", {
      deposits: deposits?.length || 0,
      filtered: filteredDeposits?.length || 0,
      paginated: paginatedDeposits?.length || 0,
      loading: isLoading
    });
  }, [deposits?.length, filteredDeposits?.length, paginatedDeposits?.length, isLoading]);
  
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
