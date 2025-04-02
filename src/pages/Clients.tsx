
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
  const loadingCountRef = useRef(0); // Count loading state changes to reduce flickering

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

  // Handle loading state and timeout with improved debouncing
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
      // Increment the loading count
      loadingCountRef.current += 1;
      
      // Show timeout message after 8 seconds if still loading
      timeoutTimerRef.current = setTimeout(() => {
        if (loading) {
          setLoadingTimeout(true);
        }
        timeoutTimerRef.current = null;
      }, 10000); // Increased from 8s to 10s
      
      // Only show loading indicator if loading persists for more than 800ms (increased from 500ms)
      // This helps avoid flashing for quick operations
      if (!loadingIndicatorShown) {
        loadingTimerRef.current = setTimeout(() => {
          if (loading) {
            setLoadingIndicatorShown(true);
          }
          loadingTimerRef.current = null;
        }, 800);
      }
    } else {
      // When loading finishes, reset states with a delay to avoid flickering
      // Only reset if we've been in a loading state for some time
      if (loadingCountRef.current > 0) {
        const resetTimer = setTimeout(() => {
          setInitialLoading(false);
          setLoadingTimeout(false);
          setLoadingIndicatorShown(false);
          loadingCountRef.current = 0; // Reset loading count
        }, 300); // Slightly longer delay for smoother transitions
        
        return () => clearTimeout(resetTimer);
      }
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
  }, [loading]);

  // Display fixed floating loading indicator instead of fullscreen one
  const renderFloatingLoadingIndicator = () => {
    if (loading && loadingIndicatorShown) {
      return (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 flex items-center gap-3 z-50 border animate-in fade-in slide-in-from-right-10 duration-300">
          <LoadingIndicator 
            size="sm" 
            fadeIn={false} 
            showImmediately 
            debounceMs={800} // Add debounce to prevent rapid flashing
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
  if ((initialLoading || loading) && loadingIndicatorShown && !clients.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <LoadingIndicator 
          size="lg" 
          text={loadingTimeout ? "Le chargement prend plus de temps que prévu..." : "Chargement des clients..."} 
          fadeIn={true}
          debounceMs={600} // Add debounce to prevent rapid flashing
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
          loading={loading}
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
