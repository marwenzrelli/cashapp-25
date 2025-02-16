import { useState } from "react";
import { Plus, Search, UserCircle, Sparkles, TrendingUp, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  solde: number;
  dateCreation: string;
  activite: "haute" | "moyenne" | "basse";
}

interface AISuggestion {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  clientId: string;
}

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

  // Données de test enrichies avec l'activité client
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      nom: "Dupont",
      prenom: "Jean",
      telephone: "0123456789",
      email: "jean.dupont@email.com",
      solde: 1500,
      dateCreation: "2024-02-20",
      activite: "haute",
    },
    {
      id: "2",
      nom: "Martin",
      prenom: "Marie",
      telephone: "0987654321",
      email: "marie.martin@email.com",
      solde: 2500,
      dateCreation: "2024-02-15",
      activite: "moyenne",
    },
  ]);

  // Suggestions IA simulées
  const aiSuggestions: AISuggestion[] = [
    {
      id: "1",
      message: "Jean Dupont montre un potentiel élevé pour des services premium",
      type: "success",
      clientId: "1",
    },
    {
      id: "2",
      message: "Marie Martin pourrait bénéficier d'une offre de fidélité",
      type: "info",
      clientId: "2",
    },
  ];

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newClientData: Client = {
      id: Date.now().toString(),
      ...newClient,
      solde: 0,
      dateCreation: new Date().toISOString().split("T")[0],
      activite: "basse",
    };
    
    setClients((prev) => [...prev, newClientData]);
    setNewClient({ nom: "", prenom: "", telephone: "", email: "" });
    setIsDialogOpen(false);
    toast.success("Client créé avec succès");
  };

  const getActivityColor = (activite: Client["activite"]) => {
    switch (activite) {
      case "haute":
        return "text-success bg-success/10";
      case "moyenne":
        return "text-yellow-500 bg-yellow-500/10";
      case "basse":
        return "text-muted-foreground bg-muted";
    }
  };

  const getSuggestionIcon = (type: AISuggestion["type"]) => {
    switch (type) {
      case "success":
        return <TrendingUp className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "info":
        return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const confirmEdit = () => {
    if (!selectedClient) return;

    setClients(prevClients =>
      prevClients.map(client =>
        client.id === selectedClient.id
          ? { ...client, ...editForm }
          : client
      )
    );

    setIsEditDialogOpen(false);
    toast.success("Client modifié avec succès");
  };

  const confirmDelete = () => {
    if (!selectedClient) return;

    setClients(prevClients =>
      prevClients.filter(client => client.id !== selectedClient.id)
    );

    setIsDeleteDialogOpen(false);
    toast.success("Client supprimé avec succès");
  };

  const [newClient, setNewClient] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
  });

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">
          Gérez vos comptes clients avec assistance IA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Suggestions IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex gap-2">
                    {getSuggestionIcon(suggestion.type)}
                    <p className="text-sm">{suggestion.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau client</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateClient} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        value={newClient.nom}
                        onChange={(e) => setNewClient({ ...newClient, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        value={newClient.prenom}
                        onChange={(e) => setNewClient({ ...newClient, prenom: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input
                        id="telephone"
                        type="tel"
                        value={newClient.telephone}
                        onChange={(e) => setNewClient({ ...newClient, telephone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Créer le client
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3">Client</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Solde</th>
                  <th className="p-3">Activité</th>
                  <th className="p-3">Date de création</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {client.prenom} {client.nom}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {client.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p>{client.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.telephone}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 font-medium">
                      {client.solde.toLocaleString()} €
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(client.activite)}`}>
                        {client.activite.charAt(0).toUpperCase() + client.activite.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {client.dateCreation}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(client)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>
              Modifiez les informations du client ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={editForm.nom}
                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                value={editForm.prenom}
                onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={editForm.telephone}
                onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmEdit}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le client sera définitivement supprimé 
              de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Clients;
