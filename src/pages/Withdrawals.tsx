
import { useState, useEffect } from "react";
import { useClients } from "@/features/clients/hooks/useClients";
import { useWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { useClientSubscription } from "@/features/withdrawals/components/useClientSubscription";
import { WithdrawalsContent } from "@/features/withdrawals/components/WithdrawalsContent";
import { containsPartialText } from "@/features/operations/utils/display-helpers";
import { supabase } from "@/integrations/supabase/client";

const Withdrawals = () => {
  const { 
    withdrawals, 
    isLoading,
    fetchWithdrawals, 
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    showDeleteDialog,
    setShowDeleteDialog
  } = useWithdrawals();

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const { clients, fetchClients, refreshClientBalance } = useClients();

  // Create a wrapper function to handle the type mismatch
  const handleRefreshClientBalance = async (clientId: string): Promise<boolean> => {
    try {
      await refreshClientBalance(parseInt(clientId, 10));
      return true;
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
    // fetchWithdrawals is already called in the useWithdrawals hook
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in Withdrawals page:", event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchClients();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchClients]);

  useClientSubscription({ fetchClients });

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (!searchTerm.trim()) return true;
    
    const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());
    
    return searchTerms.some(term => {
      // Recherche sur le nom du client
      if (containsPartialText(withdrawal.client_name, term)) return true;
      
      // Recherche sur les notes
      if (withdrawal.notes && containsPartialText(withdrawal.notes, term)) return true;
      
      // Recherche sur l'ID
      if (withdrawal.id.toString().includes(term)) return true;
      
      // Recherche sur le montant
      if (withdrawal.amount.toString().includes(term)) return true;
      
      return false;
    });
  });

  // Pagination des retraits
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * parseInt(itemsPerPage),
    currentPage * parseInt(itemsPerPage)
  );

  return (
    <WithdrawalsContent
      withdrawals={filteredWithdrawals}
      paginatedWithdrawals={paginatedWithdrawals}
      clients={clients}
      fetchWithdrawals={fetchWithdrawals}
      fetchClients={fetchClients}
      refreshClientBalance={handleRefreshClientBalance}
      deleteWithdrawal={deleteWithdrawal}
      showDeleteDialog={showDeleteDialog}
      setShowDeleteDialog={setShowDeleteDialog}
      confirmDeleteWithdrawal={confirmDeleteWithdrawal}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
  );
};

export default Withdrawals;
