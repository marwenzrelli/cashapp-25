
import { ClientsPageContent } from "@/features/clients/components/ClientsPageContent";
import { ClientDialogs } from "@/features/clients/components/ClientDialogs";
import { useClientsPage } from "@/features/clients/hooks/useClientsPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, useRef } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Clients = () => {
  // Display state management with improved debouncing
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingIndicatorShown, setLoadingIndicatorShown] = useState(false);
  const [pageReady, setPageReady] = useState(false); // État pour la transition de la page
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pageTransitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadCompleteRef = useRef(false);

  const {
    // État
    clients,
    filteredClients,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    
    // Dialog state
    isDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedClient,
    editForm,
    newClient,
    
    // Dialog actions
    setIsDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setNewClient,
    setEditForm,
    
    // Client actions
    handleRetry,
    handleEdit,
    handleDelete,
    confirmEdit,
    confirmDelete,
    handleCreateClient,
  } = useClientsPage();

  // Animation de transition de la page
  useEffect(() => {
    // Permettre un court délai pour la transition de la page
    pageTransitionTimerRef.current = setTimeout(() => {
      setPageReady(true);
    }, 150);

    return () => {
      if (pageTransitionTimerRef.current) {
        clearTimeout(pageTransitionTimerRef.current);
      }
    };
  }, []);

  // Handle only initial loading state with improved logic
  useEffect(() => {
    // Clear previous timers if they exist
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    if (loading && !initialLoadCompleteRef.current) {
      // Show timeout message after 10 seconds if still loading
      timeoutTimerRef.current = setTimeout(() => {
        if (loading) {
          setLoadingTimeout(true);
        }
        timeoutTimerRef.current = null;
      }, 10000);
      
      // Augmenter le délai avant d'afficher l'indicateur de chargement (1.5s au lieu de 800ms)
      if (!loadingIndicatorShown) {
        loadingTimerRef.current = setTimeout(() => {
          if (loading) {
            setLoadingIndicatorShown(true);
          }
          loadingTimerRef.current = null;
        }, 1500); // Augmenté de 800ms à 1500ms
      }
    } else if (!loading && initialLoading) {
      // When initial loading finishes - garder l'indicateur visible un peu plus longtemps
      const resetTimer = setTimeout(() => {
        setInitialLoading(false);
        setLoadingTimeout(false);
        setLoadingIndicatorShown(false);
        initialLoadCompleteRef.current = true;
      }, 500); // Augmenté de 300ms à 500ms pour éviter le scintillement
      
      return () => clearTimeout(resetTimer);
    }
    
    // Clean up on unmount
    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [loading, initialLoading]);

  // Display fixed floating loading indicator with improved conditions
  const renderFloatingLoadingIndicator = () => {
    // Ne pas afficher si le chargement est terminé rapidement
    if (loading && loadingIndicatorShown && !initialLoadCompleteRef.current) {
      return (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 flex items-center gap-3 z-50 border animate-in fade-in slide-in-from-right-10 duration-300">
          <LoadingIndicator 
            size="sm" 
            fadeIn={false} 
            showImmediately 
            debounceMs={0} // Pas de debounce supplémentaire ici
          />
          <span>{loadingTimeout ? "Chargement prolongé..." : "Chargement..."}</span>
          {loadingTimeout && (
            <Button size="sm" variant="ghost" className="ml-2" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }
    return null;
  };

  // Display initial loading state only when we have no data yet
  if ((initialLoading || loading) && loadingIndicatorShown && !clients.length && !initialLoadCompleteRef.current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <LoadingIndicator 
          size="lg" 
          text={loadingTimeout ? "Le chargement prend plus de temps que prévu..." : "Chargement des clients..."} 
          fadeIn={true}
          debounceMs={600}
        />
        {loadingTimeout && (
          <div className="mt-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
            <Button variant="outline" onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`w-full max-w-[100vw] pb-8 px-0 transition-opacity duration-500 ${pageReady ? 'opacity-100' : 'opacity-0'}`}>
        {renderFloatingLoadingIndicator()}
        
        <ClientsPageContent
          clients={clients}
          filteredClients={filteredClients}
          loading={loading && !initialLoadCompleteRef.current}
          error={error}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleRetry={handleRetry}
          openNewClientDialog={() => setIsDialogOpen(true)}
        />

        <ClientDialogs
          isCreateOpen={isDialogOpen}
          isEditOpen={isEditDialogOpen}
          isDeleteOpen={isDeleteDialogOpen}
          selectedClient={selectedClient}
          newClient={newClient}
          editForm={editForm}
          onCreateClose={() => setIsDialogOpen(false)}
          onEditClose={() => setIsEditDialogOpen(false)}
          onDeleteClose={() => setIsDeleteDialogOpen(false)}
          onCreateSubmit={handleCreateClient}
          onEditSubmit={confirmEdit}
          onDeleteSubmit={confirmDelete}
          onNewClientChange={setNewClient}
          onEditFormChange={setEditForm}
        />
      </div>
    </TooltipProvider>
  );
};

export default Clients;
