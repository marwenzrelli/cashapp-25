
import { ClientsPageContent } from "@/features/clients/components/ClientsPageContent";
import { ClientDialogs } from "@/features/clients/components/ClientDialogs";
import { useClientsPage } from "@/features/clients/hooks/useClientsPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, useRef } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const Clients = () => {
  // Simplified display state management
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
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
    sortBy,
    setSortBy,
    
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

  // Page transition animation - faster
  useEffect(() => {
    pageTransitionTimerRef.current = setTimeout(() => {
      setPageReady(true);
    }, 100); // Réduit de 150ms à 100ms

    return () => {
      if (pageTransitionTimerRef.current) {
        clearTimeout(pageTransitionTimerRef.current);
      }
    };
  }, []);

  // Simplified loading state management
  useEffect(() => {
    // Clear previous timeout
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    
    if (loading && !initialLoadCompleteRef.current) {
      // Show timeout message after 8 seconds (reduced from 10)
      timeoutTimerRef.current = setTimeout(() => {
        if (loading) {
          setLoadingTimeout(true);
        }
        timeoutTimerRef.current = null;
      }, 8000);
    } else if (!loading && initialLoading) {
      // Quick reset when loading finishes
      const resetTimer = setTimeout(() => {
        setInitialLoading(false);
        setLoadingTimeout(false);
        initialLoadCompleteRef.current = true;
      }, 100); // Réduit de 500ms à 100ms
      
      return () => clearTimeout(resetTimer);
    }
    
    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
    };
  }, [loading, initialLoading]);

  // Simplified floating loading indicator - only for timeout situations
  const renderFloatingLoadingIndicator = () => {
    if (loading && loadingTimeout && !initialLoadCompleteRef.current) {
      return (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 flex items-center gap-3 z-50 border animate-in fade-in slide-in-from-right-10 duration-300">
          <LoadingIndicator 
            size="sm" 
            fadeIn={false} 
            showImmediately 
            debounceMs={0}
          />
          <span>Chargement prolongé...</span>
          <Button size="sm" variant="ghost" className="ml-2" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    return null;
  };

  // Simplified initial loading - only show for longer loads
  if ((initialLoading || loading) && !clients.length && !initialLoadCompleteRef.current && loadingTimeout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <LoadingIndicator 
          size="lg" 
          text="Le chargement prend plus de temps que prévu..." 
          fadeIn={true}
          debounceMs={200} // Réduit de 600ms à 200ms
        />
        <div className="mt-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`w-full max-w-[100vw] pb-8 px-0 transition-opacity duration-300 ${pageReady ? 'opacity-100' : 'opacity-0'}`}>
        {renderFloatingLoadingIndicator()}
        
        <ClientsPageContent
          clients={clients}
          filteredClients={filteredClients}
          loading={loading && !initialLoadCompleteRef.current && loadingTimeout}
          error={error}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
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

        <ScrollToTop />
      </div>
    </TooltipProvider>
  );
};

export default Clients;
