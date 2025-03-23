
import { ClientsPageContent } from "@/features/clients/components/ClientsPageContent";
import { ClientDialogs } from "@/features/clients/components/ClientDialogs";
import { useClientsPage } from "@/features/clients/hooks/useClientsPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

const Clients = () => {
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

  // For handling page load states
  const initialLoadRef = useRef(false);
  const fetchInProgressRef = useRef(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Improved initial load handling with fallback
  useEffect(() => {
    // Only load once to prevent repeated calls
    if (!initialLoadRef.current && !fetchInProgressRef.current) {
      console.log("Starting initial clients data load");
      initialLoadRef.current = true;
      fetchInProgressRef.current = true;
      
      // Add prefetch flag to skip toast notifications on initial load
      handleRetry(false)
        .then(() => {
          console.log("Initial load complete");
          setInitialLoadComplete(true);
        })
        .catch(err => {
          console.error("Initial load failed:", err);
          // Reset flags to allow retry
          initialLoadRef.current = false;
        })
        .finally(() => {
          fetchInProgressRef.current = false;
        });
    }
    
    // Safety timeout - if after 5 seconds we still don't have data, try again
    const timeoutId = setTimeout(() => {
      if (!initialLoadComplete && loadAttempts < 2 && !fetchInProgressRef.current) {
        console.log("Load timeout reached, retrying...");
        setLoadAttempts(prev => prev + 1);
        initialLoadRef.current = false; // Reset to allow another attempt
      }
    }, 5000);
    
    // Clean up any pending operations on unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [handleRetry, initialLoadComplete, loadAttempts]);

  // If page is completely stuck, show fallback
  if (loading && !clients.length && loadAttempts >= 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <LoadingIndicator size="lg" text="Chargement prolongé... Veuillez patienter" />
        <button 
          onClick={() => {
            initialLoadRef.current = false;
            setLoadAttempts(0);
            window.location.reload();
          }}
          className="mt-8 px-4 py-2 bg-primary text-white rounded-md"
        >
          Rafraîchir la page
        </button>
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
