import { useState } from "react";
import { Plus, Search, UserCircle, Sparkles, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
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

  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      nom: "Dupont",
      prenom: "Jean",
      telephone: "0612345678",
      email: "jean.dupont@email.com",
      solde: 15000,
      dateCreation: "2024-01-15",
    },
    {
      id: "2",
      nom: "Martin",
      prenom: "Marie",
      telephone: "0687654321",
      email: "marie.martin@email.com",
      solde: 8000,
      dateCreation: "2024-02-01",
    },
    {
      id: "3",
      nom: "Durant",
      prenom: "Pierre",
      telephone: "0654321789",
      email: "pierre.durant@email.com",
      solde: 3000,
      dateCreation: "2024-02-10",
    },
  ]);

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

  const getSuggestionStyle = (type: AISuggestion["type"]) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 dark:bg-green-950/20";
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20";
      case "info":
        return "border-blue-200 bg-blue-50 dark:bg-blue-950/20";
    }
  };

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
    toast.success("Modifications enregistrées", {
      description: `Les informations de ${editForm.prenom} ${editForm.nom} ont été mises à jour avec succès.`
    });
  };

  const confirmDelete = () => {
    if (!selectedClient) return;
    setClients(prevClients =>
      prevClients.filter(client => client.id !== selectedClient.id)
    );

    setIsDeleteDialogOpen(false);
    toast.success("Client supprimé", {
      description: `${selectedClient.prenom} ${selectedClient.nom} a été retiré de la base de données.`
    });
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
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Insights IA
            </CardTitle>
            <CardDescription>
              Analyses et recommandations personnalisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${getSuggestionStyle(suggestion.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {suggestion.type === "warning" ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                    <p className="font-medium">{suggestion.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recherche intelligente</CardTitle>
            <CardDescription>
              Trouvez rapidement vos clients avec la recherche contextuelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau client
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-primary" />
            Liste des clients ({filteredClients.length})
          </CardTitle>
          <CardDescription>
            Gérez vos clients et accédez à leurs informations détaillées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3 font-medium">Client</th>
                  <th className="p-3 font-medium">Contact</th>
                  <th className="p-3 font-medium">Solde</th>
                  <th className="p-3 font-medium">Date de création</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="group border-b transition-colors hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <UserCircle className="h-10 w-10 text-primary/20 transition-colors group-hover:text-primary/40" />
                          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                        </div>
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
                      <div className="space-y-1">
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {client.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {client.telephone}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium tabular-nums">
                        {client.solde.toLocaleString()} €
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {client.dateCreation}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(client)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all"
                        >
                          <Pencil className="h-4 w-4 rotate-12 transition-all hover:rotate-45 hover:scale-110" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(client)}
                          className="hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="h-4 w-4 transition-all hover:-translate-y-1 hover:scale-110" />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-2 text-blue-600">
                <Pencil className="h-5 w-5" />
              </div>
              Modifier le client
            </DialogTitle>
            <DialogDescription className="text-base">
              Modifiez les informations de {selectedClient?.prenom} {selectedClient?.nom}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={editForm.nom}
                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                className="transition-all focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                value={editForm.prenom}
                onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                className="transition-all focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={editForm.telephone}
                onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                className="transition-all focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="transition-all focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={confirmEdit}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-2 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Êtes-vous sûr de vouloir supprimer ce client ?</p>
              {selectedClient && (
                <div className="rounded-lg border bg-muted/50 p-4 font-medium text-foreground">
                  {selectedClient.prenom} {selectedClient.nom}
                </div>
              )}
              <p className="text-destructive font-medium">Cette action est irréversible.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
