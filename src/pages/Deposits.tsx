
import { DepositsContent } from "@/features/deposits/components/DepositsContent";
import { useDepositsPage } from "@/features/deposits/hooks/useDepositsPage";
import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewDepositButton } from "@/features/deposits/components/NewDepositButton";
import { StandaloneDepositForm } from "@/features/deposits/components/DepositForm";
import { useClients } from "@/features/clients/hooks/useClients";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const Deposits = () => {
  // Track whether the auth listener was set up
  const authListenerSetup = useRef(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  
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
    totalItems,
    depositToDelete
  } = useDepositsPage();

  const { clients, refreshClientBalance } = useClients();

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

  const handleDepositSuccess = () => {
    fetchDeposits();
    setShowDepositForm(false);
  };

  const extendedClients = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  const handleRefreshClientBalance = async (clientId: string): Promise<boolean> => {
    try {
      await refreshClientBalance(parseInt(clientId, 10));
      return true;
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      return false;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <NewDepositButton 
        onClick={() => setShowDepositForm(true)}
        isVisible={!showDepositForm}
      />

      {showDepositForm && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <StandaloneDepositForm
              clients={extendedClients}
              onConfirm={handleCreateDeposit}
              refreshClientBalance={handleRefreshClientBalance}
              onSuccess={handleDepositSuccess}
              onCancel={() => setShowDepositForm(false)}
            />
          </div>
        </div>
      )}

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
        depositToDelete={depositToDelete}
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
      
      <ScrollToTop />
    </div>
  );
};

export default Deposits;
