
import { ClientsPageContent } from "@/features/clients/components/ClientsPageContent";
import { ClientDialogs } from "@/features/clients/components/ClientDialogs";
import { useClientsPage } from "@/features/clients/hooks/useClientsPage";
import { TooltipProvider } from "@/components/ui/tooltip";

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
