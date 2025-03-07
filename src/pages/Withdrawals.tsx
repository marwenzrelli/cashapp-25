
import { useState, useEffect } from "react";
import { useClients } from "@/features/clients/hooks/useClients";
import { useWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { useClientSubscription } from "@/features/withdrawals/components/useClientSubscription";
import { WithdrawalsContent } from "@/features/withdrawals/components/WithdrawalsContent";
import { containsPartialText } from "@/features/operations/utils/display-helpers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GeneralErrorState } from "@/features/admin/components/administration/GeneralErrorState";
import { NoUserProfileState } from "@/features/admin/components/administration/NoUserProfileState";

const Withdrawals = () => {
  const { 
    withdrawals, 
    isLoading,
    error,
    fetchWithdrawals, 
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    showDeleteDialog,
    setShowDeleteDialog
  } = useWithdrawals();

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [retryingAuth, setRetryingAuth] = useState(false);

  const { clients, fetchClients, refreshClientBalance } = useClients();

  const checkAuthentication = async () => {
    try {
      setRetryingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn("No active session found");
        setIsAuthenticated(false);
        toast.error("Vous devez être connecté pour accéder à cette page");
      } else {
        console.log("User is authenticated:", session.user.id);
        setIsAuthenticated(true);
        fetchClients();
      }
    } catch (error) {
      console.error("Authentication check error:", error);
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
      setRetryingAuth(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in Withdrawals page:", event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
        fetchClients();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchClients]);

  useClientSubscription({ fetchClients });

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

  // If still checking auth status, show nothing yet
  if (authChecking) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  // If not authenticated
  if (!isAuthenticated) {
    return (
      <NoUserProfileState 
        isRetrying={retryingAuth}
        onRetry={checkAuthentication}
      />
    );
  }

  // If there's an error fetching data
  if (error) {
    return (
      <GeneralErrorState 
        errorMessage={error}
        isRetrying={isLoading} 
        onRetry={fetchWithdrawals}
      />
    );
  }

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
