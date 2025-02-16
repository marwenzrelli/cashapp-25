
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
import { ArrowUpCircle, Plus, Sparkles, Search, UserCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Deposit {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  notes: string;
}

interface AISuggestion {
  id: string;
  message: string;
  amount: number;
  clientName: string;
}

const Deposits = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [newDeposit, setNewDeposit] = useState({
    clientName: "",
    amount: "",
    notes: "",
  });
  const [editForm, setEditForm] = useState({
    clientName: "",
    amount: "",
    notes: "",
  });

  const [deposits, setDeposits] = useState<Deposit[]>([
    {
      id: "1",
      clientName: "Jean Dupont",
      amount: 1500,
      date: "2024-02-22",
      notes: "Versement mensuel",
    },
    {
      id: "2",
      clientName: "Marie Martin",
      amount: 2500,
      date: "2024-02-21",
      notes: "Versement initial",
    },
  ]);

  const aiSuggestions: AISuggestion[] = [
    {
      id: "1",
      message: "Versement mensuel habituel recommandé",
      amount: 1500,
      clientName: "Jean Dupont",
    },
    {
      id: "2",
      message: "Opportunité de versement détectée",
      amount: 3000,
      clientName: "Marie Martin",
    },
  ];

  const handleCreateDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const deposit: Deposit = {
      id: Date.now().toString(),
      clientName: newDeposit.clientName,
      amount: parseFloat(newDeposit.amount),
      date: new Date().toISOString().split("T")[0],
      notes: newDeposit.notes,
    };

    setDeposits((prev) => [deposit, ...prev]);
    setNewDeposit({ clientName: "", amount: "", notes: "" });
    setIsDialogOpen(false);
    toast.success("Versement enregistré avec succès");
  };

  const handleEdit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setEditForm({
      clientName: deposit.clientName,
      amount: deposit.amount.toString(),
      notes: deposit.notes,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setIsDeleteDialogOpen(true);
  };

  const confirmEdit = () => {
    if (!selectedDeposit) return;
    setDeposits(prevDeposits =>
      prevDeposits.map(deposit =>
        deposit.id === selectedDeposit.id
          ? {
              ...deposit,
              clientName: editForm.clientName,
              amount: parseFloat(editForm.amount),
              notes: editForm.notes,
            }
          : deposit
      )
    );

    setIsEditDialogOpen(false);
    toast.success("Versement modifié", {
      description: `Le versement de ${editForm.clientName} a été mis à jour avec succès.`
    });
  };

  const confirmDelete = () => {
    if (!selectedDeposit) return;
    setDeposits(prevDeposits =>
      prevDeposits.filter(deposit => deposit.id !== selectedDeposit.id)
    );

    setIsDeleteDialogOpen(false);
    toast.success("Versement supprimé", {
      description: `Le versement de ${selectedDeposit.clientName} a été supprimé avec succès.`
    });
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    setNewDeposit({
      clientName: suggestion.clientName,
      amount: suggestion.amount.toString(),
      notes: "Suggestion IA",
    });
    setIsDialogOpen(true);
    toast.success("Suggestion appliquée");
  };

  const filteredDeposits = deposits.filter(
    (deposit) =>
      deposit.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Versements</h1>
        <p className="text-muted-foreground">
          Gérez les versements avec assistance IA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Suggestions Intelligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{suggestion.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.message}
                      </p>
                    </div>
                    <p className="font-medium text-success">
                      {suggestion.amount.toLocaleString()} €
                    </p>
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
                  placeholder="Rechercher un versement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau versement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau versement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateDeposit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Client</Label>
                      <Input
                        id="clientName"
                        value={newDeposit.clientName}
                        onChange={(e) =>
                          setNewDeposit({ ...newDeposit, clientName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Montant</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newDeposit.amount}
                        onChange={(e) =>
                          setNewDeposit({ ...newDeposit, amount: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={newDeposit.notes}
                        onChange={(e) =>
                          setNewDeposit({ ...newDeposit, notes: e.target.value })
                        }
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Créer le versement
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
          <CardTitle>Historique des versements</CardTitle>
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
                {filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="group border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <UserCircle className="h-8 w-8 text-primary/20 transition-colors group-hover:text-primary/40" />
                          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                        </div>
                        <div>
                          <p className="font-medium">{deposit.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {deposit.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-success">
                        <ArrowUpCircle className="h-4 w-4" />
                        <span className="font-medium">
                          {deposit.amount.toLocaleString()} €
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{deposit.date}</td>
                    <td className="p-3 text-muted-foreground">{deposit.notes}</td>
                    <td className="p-3">
                      <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(deposit)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all"
                        >
                          <Pencil className="h-4 w-4 rotate-12 transition-all hover:rotate-45 hover:scale-110" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(deposit)}
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
            {filteredDeposits.length === 0 && (
              <p className="text-center text-muted-foreground p-4">
                Aucun versement trouvé
              </p>
            )}
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
              Modifier le versement
            </DialogTitle>
            <DialogDescription className="text-base">
              Modifiez les informations du versement de {selectedDeposit?.clientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-clientName">Client</Label>
              <Input
                id="edit-clientName"
                value={editForm.clientName}
                onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                className="transition-all focus-visible:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Montant</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                className="transition-all focus-visible:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
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
              <p>Êtes-vous sûr de vouloir supprimer ce versement ?</p>
              {selectedDeposit && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="font-medium text-foreground">
                    Client : {selectedDeposit.clientName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Montant : {selectedDeposit.amount.toLocaleString()} €
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Date : {selectedDeposit.date}
                  </div>
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

export default Deposits;
