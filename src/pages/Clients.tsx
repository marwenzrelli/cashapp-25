
import { useState, useEffect } from "react";
import { ClientInsights } from "@/features/clients/components/ClientInsights";
import { ClientSearch } from "@/features/clients/components/ClientSearch";
import { ClientList } from "@/features/clients/components/ClientList";
import { ClientDialogs } from "@/features/clients/components/ClientDialogs";
import { Client, AISuggestion } from "@/features/clients/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
  });

  const [newClient, setNewClient] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    solde: 0,
  });

  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('date_creation', { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des clients");
      console.error("Error fetching clients:", error);
      return;
    }

    if (data) {
      setClients(data);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

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

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setEditForm({
      nom: client.nom,
      prenom: client.prenom,
      telephone: client.telephone,
      email: client.email,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!selectedClient) return;

    const { error } = await supabase
      .from('clients')
      .update({
        nom: editForm.nom,
        prenom: editForm.prenom,
        telephone: editForm.telephone,
        email: editForm.email
      })
      .eq('id', selectedClient.id);

    if (error) {
      toast.error("Erreur lors de la modification du client");
      console.error("Error updating client:", error);
      return;
    }

    await fetchClients();
    setIsEditDialogOpen(false);
    toast.success("Modifications enregistrées", {
      description: `Les informations de ${editForm.prenom} ${editForm.nom} ont été mises à jour avec succès.`
    });
  };

  const confirmDelete = async () => {
    if (!selectedClient) return;

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', selectedClient.id);

    if (error) {
      toast.error("Erreur lors de la suppression du client");
      console.error("Error deleting client:", error);
      return;
    }

    await fetchClients();
    setIsDeleteDialogOpen(false);
    toast.success("Client supprimé", {
      description: `${selectedClient.prenom} ${selectedClient.nom} a été retiré de la base de données.`
    });
  };

  const handleCreateClient = async () => {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...newClient,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de la création du client");
      console.error("Error creating client:", error);
      return;
    }

    if (data) {
      await fetchClients();
      setIsDialogOpen(false);
      toast.success("Nouveau client créé", {
        description: `${newClient.prenom} ${newClient.nom} a été ajouté avec succès.`
      });
      setNewClient({ nom: "", prenom: "", telephone: "", email: "", solde: 0 });
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
