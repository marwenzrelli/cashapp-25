import { useState } from "react";
import { Plus, Search, UserCircle, Sparkles, TrendingUp, AlertCircle, Pencil, Trash2, Star, ChevronDown } from "lucide-react";
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
  activite: "haute" | "moyenne" | "basse";
  score?: number;
}

interface AISuggestion {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
  clientId: string;
  insights?: string[];
  action?: string;
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
      activite: "haute",
      score: 92,
    },
    {
      id: "2",
      nom: "Martin",
      prenom: "Marie",
      telephone: "0687654321",
      email: "marie.martin@email.com",
      solde: 8000,
      dateCreation: "2024-02-01",
      activite: "moyenne",
      score: 78,
    },
    {
      id: "3",
      nom: "Durant",
      prenom: "Pierre",
      telephone: "0654321789",
      email: "pierre.durant@email.com",
      solde: 3000,
      dateCreation: "2024-02-10",
      activite: "basse",
      score: 45,
    },
  ]);

  const aiSuggestions: AISuggestion[] = [
    {
      id: "1",
      message: "Client à fort potentiel détecté",
      type: "success",
      clientId: "1",
      insights: [
        "Score de fidélité élevé (92/100)",
        "Activité en hausse de 25% ce mois-ci",
        "Profil similaire aux meilleurs clients"
      ],
      action: "Proposer des services premium",
    },
    {
      id: "2",
      message: "Risque de désengagement détecté",
      type: "warning",
      clientId: "3",
      insights: [
        "Baisse d'activité de 40% sur 3 mois",
        "Diminution des interactions",
        "Profil à risque selon l'analyse prédictive"
      ],
      action: "Programme de rétention recommandé",
    },
  ];

  const getActivityColor = (activite: Client["activite"]) => {
    switch (activite) {
      case "haute":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "moyenne":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "basse":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

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
    toast.success("Client modifié avec succès", {
      description: "Les modifications ont été enregistrées"
    });
  };

  const confirmDelete = () => {
    if (!selectedClient) return;
    setClients(prevClients =>
      prevClients.filter(client => client.id !== selectedClient.id)
    );

    setIsDeleteDialogOpen(false);
    toast.success("Client supprimé avec succès", {
      description: "Le client a été retiré de la base de données"
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
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {suggestion.type === "warning" ? (
                        <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                      ) : (
                        <Star className="h-5 w-5 text-green-500 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{suggestion.message}</p>
                        {suggestion.action && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {suggestion.action}
                          </p>
                        )}
                      </div>
                    </div>
                    {suggestion.insights && (
                      <div className="ml-8 space-y-1 text-sm">
                        {suggestion.insights.map((insight, index) => (
                          <p key={index} className="text-muted-foreground flex items-center gap-2">
                            <ChevronDown className="h-3 w-3" />
                            {insight}
                          </p>
                        ))}
                      </div>
                    )}
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
          <CardTitle>Liste des clients ({filteredClients.length})</CardTitle>
          <CardDescription>
            Gérez vos clients et accédez à leurs informations détaillées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3">Client</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Score IA</th>
                  <th className="p-3">Solde</th>
                  <th className="p-3">Activité</th>
                  <th className="p-3">Date de création</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-muted/50 transition-colors">
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
                    <td className="p-3">
                      {client.score && (
                        <div className={`font-semibold ${getScoreColor(client.score)}`}>
                          {client.score}/100
                        </div>
                      )}
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
                          className="text-destructive hover:text-destructive"
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
