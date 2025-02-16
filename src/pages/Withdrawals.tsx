import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  UserCircle, 
  ArrowDownCircle, 
  Pencil, 
  Trash2, 
  User,
  BadgeDollarSign,
  ScrollText,
  Sparkles,
  AlertCircle,
  ListFilter
} from "lucide-react";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  solde: number;
  dateCreation: string;
}

const mockClients: Client[] = [
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
];

const Withdrawals = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState([
    {
      id: "1",
      clientId: "1",
      amount: 500,
      date: "2024-02-22",
      notes: "Retrait mensuel",
    },
    {
      id: "2",
      clientId: "2",
      amount: 1000,
      date: "2024-02-21",
      notes: "Retrait exceptionnel",
    },
  ]);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [newWithdrawal, setNewWithdrawal] = useState({
    clientId: "",
    amount: "",
    notes: "",
  });

  const handleDelete = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedWithdrawal) return;
    setWithdrawals(prevWithdrawals =>
      prevWithdrawals.filter(w => w.id !== selectedWithdrawal.id)
    );
    setIsDeleteDialogOpen(false);
    toast.success("Retrait supprimé", {
      description: `Le retrait a été retiré de la base de données.`
    });
  };

  const handleEdit = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setIsDialogOpen(true);
    toast.info("Mode édition", {
      description: `Modification du retrait de ${withdrawal.amount}€`
    });
  };

  const handleCreateWithdrawal = () => {
    if (!newWithdrawal.clientId || !newWithdrawal.amount || !newWithdrawal.notes) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    const selectedClient = mockClients.find(c => c.id === newWithdrawal.clientId);
    if (!selectedClient) {
      toast.error("Client non trouvé");
      return;
    }

    const withdrawal = {
      id: Date.now().toString(),
      clientId: newWithdrawal.clientId,
      amount: parseFloat(newWithdrawal.amount),
      date: new Date().toISOString().split('T')[0],
      notes: newWithdrawal.notes,
    };

    setWithdrawals(prev => [withdrawal, ...prev]);
    setIsDialogOpen(false);
    toast.success("Retrait enregistré", {
      description: `Le retrait de ${withdrawal.amount}€ pour ${selectedClient.prenom} ${selectedClient.nom} a été enregistré.`
    });
    setNewWithdrawal({ clientId: "", amount: "", notes: "" });
  };

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Retraits</h1>
        <p className="text-muted-foreground">
          Gérez les retraits des clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un retrait..."
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={itemsPerPage}
                  onValueChange={setItemsPerPage}
                >
                  <SelectTrigger className="w-[180px] bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                    <ListFilter className="h-4 w-4 mr-2 text-primary" />
                    <SelectValue placeholder="Nombre d'éléments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 éléments</SelectItem>
                    <SelectItem value="25">25 éléments</SelectItem>
                    <SelectItem value="50">50 éléments</SelectItem>
                    <SelectItem value="100">100 éléments</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  {withdrawals.length} résultats
                </div>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau retrait
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="rounded-xl bg-red-100 dark:bg-red-900/20 p-2">
                <ArrowDownCircle className="h-6 w-6 text-red-600" />
              </div>
              Nouveau retrait
            </DialogTitle>
            <DialogDescription className="text-base">
              Enregistrez un nouveau retrait pour un client
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-background to-muted/50 p-6">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
              <div className="relative grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client</Label>
                  <Select
                    value={newWithdrawal.clientId}
                    onValueChange={(value) => setNewWithdrawal({ ...newWithdrawal, clientId: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.prenom} {client.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Montant</Label>
                  <div className="relative">
                    <BadgeDollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={newWithdrawal.amount}
                      onChange={(e) => setNewWithdrawal({ ...newWithdrawal, amount: e.target.value })}
                      className="pl-9 transition-all focus-visible:ring-primary/50"
                    />
                    <span className="absolute right-3 top-3 text-muted-foreground">€</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <div className="relative">
                    <ScrollText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="notes"
                      placeholder="Motif du retrait..."
                      value={newWithdrawal.notes}
                      onChange={(e) => setNewWithdrawal({ ...newWithdrawal, notes: e.target.value })}
                      className="pl-9 transition-all focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 rounded-lg border bg-muted/50 p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Recommandations IA</h4>
                    <p className="text-sm text-muted-foreground">
                      Vérifiez le solde disponible et les limites de retrait avant de valider l'opération.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 rounded-lg border bg-muted/50 p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Vérifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Une pièce d'identité valide est requise pour les retraits supérieurs à 1000€.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="gap-2"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateWithdrawal}
              className="bg-red-600 hover:bg-red-700 text-white gap-2 min-w-[200px]"
            >
              <ArrowDownCircle className="h-4 w-4" />
              Effectuer le retrait
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des retraits</CardTitle>
            <div className="text-sm text-muted-foreground">
              Affichage de {Math.min(parseInt(itemsPerPage), withdrawals.length)} sur {withdrawals.length} retraits
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3">Client</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.slice(0, parseInt(itemsPerPage)).map((withdrawal) => {
                  const client = mockClients.find(c => c.id === withdrawal.clientId);
                  if (!client) return null;
                  
                  return (
                    <tr key={withdrawal.id} className="group border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <UserCircle className="h-8 w-8 text-primary/20 transition-colors group-hover:text-primary/40" />
                            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                          </div>
                          <div>
                            <p className="font-medium">{client.prenom} {client.nom}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {client.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-danger">
                          <ArrowDownCircle className="h-4 w-4" />
                          <span className="font-medium">
                            {withdrawal.amount.toLocaleString()} €
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{withdrawal.date}</td>
                      <td className="p-3 text-muted-foreground">{withdrawal.notes}</td>
                      <td className="p-3">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(withdrawal)}
                            className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all duration-300"
                          >
                            <Pencil className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:rotate-[360deg]" />
                            <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(withdrawal)}
                            className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:-translate-y-1" />
                            <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
              <p>Êtes-vous sûr de vouloir supprimer ce retrait ?</p>
              {selectedWithdrawal && (
                <div className="rounded-lg border bg-muted/50 p-4 font-medium text-foreground">
                  Retrait de {selectedWithdrawal.amount}€
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

export default Withdrawals;
