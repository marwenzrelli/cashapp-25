
import { ClientsPageContent } from "@/features/clients/components/ClientsPageContent";
import { ClientDialogs } from "@/features/clients/components/ClientDialogs";
import { useClientsPage } from "@/features/clients/hooks/useClientsPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, useRef } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const Clients = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingShown, setLoadingShown] = useState(false);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle initial loading state and timeout
  useEffect(() => {
    // Clear any existing timers when component unmounts or dependencies change
    return () => {
      if (initialTimerRef.current) {
        clearTimeout(initialTimerRef.current);
        initialTimerRef.current = null;
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Clear previous timers
    if (initialTimerRef.current) {
      clearTimeout(initialTimerRef.current);
      initialTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    
    if (loading && !loadingShown) {
      setLoadingShown(true);
      
      // Show loading indicator for at least 1 second
      initialTimerRef.current = setTimeout(() => {
        setInitialLoading(false);
        initialTimerRef.current = null;
      }, 1000);
      
      // Show timeout message after 10 seconds if still loading
      timeoutTimerRef.current = setTimeout(() => {
        if (loading && !error) {
          setLoadingTimeout(true);
        }
        timeoutTimerRef.current = null;
      }, 10000);
    }
    
    // Reset loading state when loading finishes or errors occur
    if (!loading || error) {
      setLoadingShown(false);
      setInitialLoading(false);
      setLoadingTimeout(false);
    }
  }, [loading, error, loadingShown]);

  // Display fullscreen loading for initial load
  if (initialLoading && loading && !clients.length) {
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
