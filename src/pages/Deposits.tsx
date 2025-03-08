
import { DepositsContent } from "@/features/deposits/components/DepositsContent";
import { useDepositsPage } from "@/features/deposits/hooks/useDepositsPage";
import { useEffect } from "react";
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

  console.log("Deposits page render - deposits count:", deposits?.length);
  console.log("Deposits page render - filtered deposits count:", filteredDeposits?.length);
  console.log("Deposits page render - paginated deposits count:", paginatedDeposits?.length);
  console.log("Deposits page render - isLoading:", isLoading);
  
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
