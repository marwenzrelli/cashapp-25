
import { useState, useEffect } from "react";
import { useClients } from "@/features/clients/hooks/useClients";
import { useWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { useClientSubscription } from "@/features/withdrawals/components/useClientSubscription";
import { WithdrawalsContent } from "@/features/withdrawals/components/WithdrawalsContent";
import { containsPartialText } from "@/features/operations/utils/display-helpers";
import { GeneralErrorState } from "@/features/admin/components/administration/GeneralErrorState";
import { NoUserProfileState } from "@/features/admin/components/administration/NoUserProfileState";
import { LoadingState } from "@/features/admin/components/administration/LoadingState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthenticationCheck } from "@/features/admin/hooks/useAuthenticationCheck";

const Withdrawals = () => {
  useAuthenticationCheck(); // Add this to ensure we're authenticated

  const { 
    withdrawals, 
    isLoading,
    error,
    fetchWithdrawals, 
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    showDeleteDialog,
    setShowDeleteDialog,
    isAuthenticated,
    authChecking,
    checkAuth,
    networkStatus,
    retrying
  } = useWithdrawals();

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [retryingAuth, setRetryingAuth] = useState(false);

  const { clients, fetchClients, refreshClientBalance } = useClients();

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated, fetchClients]);

  useClientSubscription({ fetchClients });

  useEffect(() => {
    // Reset current page when search term changes
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAuthRetry = async () => {
    setRetryingAuth(true);
    await checkAuth();
    if (isAuthenticated) {
      fetchClients();
      fetchWithdrawals();
    }
    setRetryingAuth(false);
  };

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

  // If still checking auth status, show loading state
  if (authChecking && !isAuthenticated) {
    return <LoadingState message="Vérification de l'authentification..." variant="minimal" />;
  }

  // If not authenticated
  if (isAuthenticated === false) {
    return (
      <NoUserProfileState 
        isRetrying={retryingAuth}
        onRetry={handleAuthRetry}
      />
    );
  }

  // Show network status alert
  if (networkStatus === 'offline') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <Alert variant="destructive" className="mb-6">
          <WifiOff className="h-5 w-5 mr-2" />
          <AlertTitle>Connexion Internet perdue</AlertTitle>
          <AlertDescription>
            Veuillez vérifier votre connexion internet et réessayer.
          </AlertDescription>
        </Alert>
        <GeneralErrorState 
          errorMessage="Problème de connexion réseau"
          isRetrying={isLoading} 
          onRetry={fetchWithdrawals}
        />
      </div>
    );
  }

  if (networkStatus === 'reconnecting') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <Wifi className="h-5 w-5 mr-2 text-yellow-600" />
          <AlertTitle>Tentative de reconnexion...</AlertTitle>
          <AlertDescription>
            Nous essayons de rétablir la connexion avec le serveur.
          </AlertDescription>
        </Alert>
        <LoadingState message="Tentative de reconnexion en cours..." retrying={true} />
      </div>
    );
  }

  // If there's an error fetching data
  if (error) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
          <AlertTitle>Problème de chargement</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button 
            onClick={fetchWithdrawals} 
            variant="default"
            disabled={isLoading || retrying}
          >
            {isLoading || retrying ? 'Chargement...' : 'Réessayer'}
          </Button>
        </div>
        
        {!isLoading && withdrawals.length > 0 && (
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
        )}
      </div>
    );
  }

  // Show loading state while fetching data
  if (isLoading && !error && withdrawals.length === 0) {
    return <LoadingState message="Chargement des retraits..." retrying={retrying} />;
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
