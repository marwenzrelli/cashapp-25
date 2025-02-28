
import { useState, useEffect } from "react";
import { ClientInsights } from "@/features/clients/components/ClientInsights";
import { ClientSearch } from "@/features/clients/components/ClientSearch";
import { ClientList } from "@/features/clients/components/ClientList";
import { ClientDialogs } from "@/features/clients/components/ClientDialogs";
import { AISuggestion } from "@/features/clients/types";
import { useClients } from "@/features/clients/hooks/useClients";
import { useClientDialogs } from "@/features/clients/hooks/useClientDialogs";
import { toast } from "sonner";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { 
    clients,
    loading,
    error,
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
    console.log("Chargement initial des clients...");
    fetchClients();
  }, [fetchClients]);

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
    // Validation des champs requis
    if (!newClient.prenom.trim() || !newClient.nom.trim() || !newClient.telephone.trim()) {
      toast.error("Informations incomplètes", {
        description: "Veuillez remplir au moins le prénom, le nom et le téléphone du client."
      });
      return;
    }

    // Ajout du status par défaut 'active' lors de la création
    const clientData = {
      ...newClient,
      status: 'active'
    };
    
    const success = await createClient(clientData);
    
    if (success) {
      setIsDialogOpen(false);
      toast.success("Nouveau client créé", {
        description: `${newClient.prenom} ${newClient.nom} a été ajouté avec succès.`
      });
      resetNewClient();
    }
  };

  const handleRetry = () => {
    console.log("Tentative de rechargement des clients...");
    fetchClients();
  };

  const filteredClients = clients.filter((client) =>
    `${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.includes(searchTerm)
  );

  // Rendu conditionnel en fonction de l'état du chargement et des erreurs
  const renderContent = () => {
    if (loading && clients.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Chargement des clients...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Erreur de connexion</h3>
            <p className="text-muted-foreground max-w-md">{error}</p>
          </div>
          <Button 
            onClick={handleRetry} 
            variant="outline" 
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      );
    }

    if (clients.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <p className="text-muted-foreground">Aucun client trouvé.</p>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            variant="default"
          >
            Ajouter un client
          </Button>
        </div>
      );
    }

    return (
      <ClientList
        clients={filteredClients}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  };

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

      {renderContent()}

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
