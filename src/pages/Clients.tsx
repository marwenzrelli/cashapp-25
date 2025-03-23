
import { ClientsPageContent } from "@/features/clients/components/ClientsPageContent";
import { ClientDialogs } from "@/features/clients/components/ClientDialogs";
import { useClientsPage } from "@/features/clients/hooks/useClientsPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

const Clients = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [loadingShown, setLoadingShown] = useState(false);

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
    if (loading && !loadingShown) {
      setLoadingShown(true);
      
      // Show loading indicator for at least 1 second
      const initialTimer = setTimeout(() => {
        setInitialLoading(false);
      }, 1000);
      
      // Show timeout message after 15 seconds if still loading
      const timeoutTimer = setTimeout(() => {
        if (loading && !error) {
          setLoadingTimeout(true);
        }
      }, 15000);
      
      return () => {
        clearTimeout(initialTimer);
        clearTimeout(timeoutTimer);
      };
    }
    
    // Reset loading state when loading finishes
    if (!loading) {
      setLoadingShown(false);
      setInitialLoading(false);
      setLoadingTimeout(false);
    }
  }, [loading, error, loadingShown]);

  // Display fullscreen loading for initial load
  if (initialLoading && loading && !clients.length) {
    return (
      <LoadingIndicator 
        fullscreen={true} 
        size="lg" 
        text={loadingTimeout ? "Le chargement prend plus de temps que prévu..." : "Chargement des clients..."} 
      />
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
