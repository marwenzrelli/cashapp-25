
import { ClientsPageContent } from "@/features/clients/components/ClientsPageContent";
import { ClientDialogs } from "@/features/clients/components/ClientDialogs";
import { useClientsPage } from "@/features/clients/hooks/useClientsPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, useRef } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Clients = () => {
  // Display state management
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingIndicatorShown, setLoadingIndicatorShown] = useState(false); 
  const [pageReady, setPageReady] = useState(false); // État pour la transition de la page
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pageTransitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pageRenderedRef = useRef(false);

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
    if (pageRenderedRef.current) return;
    
    pageRenderedRef.current = true;
    
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

  // Handle loading state and timeout
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
    
    // Only set up timers if we're in a loading state
    if (loading) {
      // Show timeout message after 8 seconds if still loading
      timeoutTimerRef.current = setTimeout(() => {
        if (loading) {
          setLoadingTimeout(true);
        }
        timeoutTimerRef.current = null;
      }, 8000);
      
      // Only show loading indicator if loading persists for more than 500ms
      // This prevents flickering for quick operations
      if (!loadingIndicatorShown) {
        loadingTimerRef.current = setTimeout(() => {
          if (loading) {
            setLoadingIndicatorShown(true);
          }
          loadingTimerRef.current = null;
        }, 500);
      }
    } else {
      // When loading finishes, reset states with a small delay
      const resetTimer = setTimeout(() => {
        setInitialLoading(false);
        setLoadingTimeout(false);
        // Garde l'indicateur de chargement un peu plus longtemps pour une transition plus douce
        setTimeout(() => {
          setLoadingIndicatorShown(false);
        }, 300);
      }, 150);
      
      return () => clearTimeout(resetTimer);
    }
    
    // Clean up on unmount
    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, [loading]);

  // Display fullscreen loading only for initial load when we don't have cached data
  const shouldShowFullscreenLoading = (initialLoading || loading) && 
                                      loadingIndicatorShown && 
                                      !clients.length;
  
  if (shouldShowFullscreenLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] transition-opacity duration-300">
        <LoadingIndicator 
          fullscreen={true} 
          size="lg" 
          text={loadingTimeout ? "Le chargement prend plus de temps que prévu..." : "Chargement des clients..."} 
          fadeIn={true}
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
        <ClientsPageContent
          clients={clients}
          filteredClients={filteredClients}
          loading={loading && loadingIndicatorShown}
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
