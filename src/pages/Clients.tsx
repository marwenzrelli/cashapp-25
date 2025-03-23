
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
  const [loadingIndicatorShown, setLoadingIndicatorShown] = useState(true);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    // State
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
      
      // Only show loading indicator if loading persists for more than 300ms
      // This prevents flickering for quick operations
      if (!loadingIndicatorShown) {
        loadingTimerRef.current = setTimeout(() => {
          if (loading) {
            setLoadingIndicatorShown(true);
          }
          loadingTimerRef.current = null;
        }, 300);
      }
    } else {
      // When loading finishes, reset states
      setInitialLoading(false);
      setLoadingTimeout(false);
      setLoadingIndicatorShown(false);
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
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <LoadingIndicator 
          fullscreen={true} 
          size="lg" 
          text={loadingTimeout ? "Le chargement prend plus de temps que prévu..." : "Chargement des clients..."} 
        />
        {loadingTimeout && (
          <div className="mt-6">
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
      <div className="w-full max-w-[100vw] pb-8 px-0">
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
