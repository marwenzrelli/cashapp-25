
import { useState, useEffect } from "react";
import { ClientInsights } from "@/features/clients/components/ClientInsights";
import { ClientSearch } from "@/features/clients/components/ClientSearch";
import { ClientList } from "@/features/clients/components/ClientList";
import { ClientDialogs } from "@/features/clients/components/ClientDialogs";
import { AISuggestion } from "@/features/clients/types";
import { useClients } from "@/features/clients/hooks/useClients";
import { useClientDialogs } from "@/features/clients/hooks/useClientDialogs";
import { toast } from "sonner";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { 
    clients,
    fetchClients,
    updateClient,
    deleteClient,
    createClient
  } = useClients();

  const {
    isDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedClient,
    editForm,
    newClient,
    setIsDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setEditForm,
    setNewClient,
    handleEdit,
    handleDelete,
    resetNewClient
  } = useClientDialogs();

  useEffect(() => {
    console.log("Chargement des clients...");
    fetchClients();
  }, []);

  console.log("Clients actuels:", clients);

  const aiSuggestions: AISuggestion[] = [
    {
      id: "1",
      message: "Nouveau client potentiel détecté",
      type: "success",
      clientId: "1",
    },
    {
      id: "2",
      message: "Mise à jour des informations recommandée",
      type: "info",
      clientId: "3",
    },
  ];

  const confirmEdit = async () => {
    if (!selectedClient) return;

    const success = await updateClient(selectedClient.id, editForm);
    
    if (success) {
      setIsEditDialogOpen(false);
      toast.success("Modifications enregistrées", {
        description: `Les informations de ${editForm.prenom} ${editForm.nom} ont été mises à jour avec succès.`
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedClient) return;

    const success = await deleteClient(selectedClient.id);
    
    if (success) {
      setIsDeleteDialogOpen(false);
      toast.success("Client supprimé", {
        description: `${selectedClient.prenom} ${selectedClient.nom} a été retiré de la base de données.`
      });
    }
  };

  const handleCreateClient = async () => {
    console.log("Création d'un nouveau client:", newClient);
    const success = await createClient(newClient);
    
    if (success) {
      setIsDialogOpen(false);
      toast.success("Nouveau client créé", {
        description: `${newClient.prenom} ${newClient.nom} a été ajouté avec succès.`
      });
      resetNewClient();
    }
  };

  const filteredClients = clients.filter((client) =>
    `${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Gestion des clients</h1>
        <p className="text-muted-foreground">
          Gérez vos clients avec l'aide de l'intelligence artificielle
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ClientInsights suggestions={aiSuggestions} />
        <ClientSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onNewClient={() => setIsDialogOpen(true)}
        />
      </div>

      <ClientList
        clients={filteredClients}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
  );
};

export default Clients;
