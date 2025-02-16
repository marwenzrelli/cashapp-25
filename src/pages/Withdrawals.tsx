import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
import { Plus, Search, UserCircle, ArrowDownCircle, Sparkles, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Withdrawal {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  notes: string;
}

interface AISuggestion {
  id: string;
  message: string;
  type: "warning" | "info";
  clientName: string;
  recommendedAction?: string;
}

const Withdrawals = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newWithdrawal, setNewWithdrawal] = useState({
    clientName: "",
    amount: "",
    notes: "",
  });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    clientName: "",
    amount: "",
    notes: "",
  });

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    {
      id: "1",
      clientName: "Jean Dupont",
      amount: 500,
      date: "2024-02-22",
      notes: "Retrait mensuel",
    },
    {
      id: "2",
      clientName: "Marie Martin",
      amount: 1000,
      date: "2024-02-21",
      notes: "Retrait exceptionnel",
    },
  ]);

  const aiSuggestions: AISuggestion[] = [
    {
      id: "1",
      message: "Activité inhabituelle détectée",
      type: "warning",
      clientName: "Jean Dupont",
      recommendedAction: "Vérification d'identité recommandée",
    },
    {
      id: "2",
      message: "Optimisation de limite de retrait possible",
      type: "info",
      clientName: "Marie Martin",
      recommendedAction: "Augmentation temporaire de la limite suggérée",
    },
  ];

  const handleCreateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawal: Withdrawal = {
      id: Date.now().toString(),
      clientName: newWithdrawal.clientName,
      amount: parseFloat(newWithdrawal.amount),
      date: new Date().toISOString().split("T")[0],
      notes: newWithdrawal.notes,
    };

    setWithdrawals((prev) => [withdrawal, ...prev]);
    setNewWithdrawal({ clientName: "", amount: "", notes: "" });
    setIsDialogOpen(false);
    toast.success("Demande de retrait enregistrée avec succès");
  };

  const getSuggestionStyle = (type: AISuggestion["type"]) => {
    return type === "warning" 
      ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20" 
      : "border-blue-200 bg-blue-50 dark:bg-blue-950/20";
  };

  const handleEdit = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setEditForm({
      clientName: withdrawal.clientName,
      amount: withdrawal.amount.toString(),
      notes: withdrawal.notes,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsDeleteDialogOpen(true);
  };

  const confirmEdit = () => {
    if (!selectedWithdrawal) return;

    setWithdrawals((prev) =>
      prev.map((withdrawal) =>
        withdrawal.id === selectedWithdrawal.id
          ? {
              ...withdrawal,
              clientName: editForm.clientName,
              amount: parseFloat(editForm.amount),
              notes: editForm.notes,
            }
          : withdrawal
      )
    );

    setIsEditDialogOpen(false);
    toast.success("Retrait modifié avec succès");
  };

  const confirmDelete = () => {
    if (!selectedWithdrawal) return;

    setWithdrawals((prev) =>
      prev.filter((withdrawal) => withdrawal.id !== selectedWithdrawal.id)
    );

    setIsDeleteDialogOpen(false);
    toast.success("Retrait supprimé avec succès");
  };

  const filteredWithdrawals = withdrawals.filter(
    (withdrawal) =>
      withdrawal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Retraits</h1>
        <p className="text-muted-foreground">
          Gérez les retraits avec assistance IA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Analyses et Recommandations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border ${getSuggestionStyle(suggestion.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {suggestion.type === "warning" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-primary shrink-0" />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium">{suggestion.clientName}</p>
                      <p className="text-sm">{suggestion.message}</p>
                      {suggestion.recommendedAction && (
                        <p className="text-sm text-muted-foreground">
                          {suggestion.recommendedAction}
                        </p>
                      )}
                    </div>
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
                  placeholder="Rechercher un retrait..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau retrait
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une demande de retrait</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateWithdrawal} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Client</Label>
                      <Input
                        id="clientName"
                        value={newWithdrawal.clientName}
                        onChange={(e) =>
                          setNewWithdrawal({ ...newWithdrawal, clientName: e.target.value })
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
                        value={newWithdrawal.amount}
                        onChange={(e) =>
                          setNewWithdrawal({ ...newWithdrawal, amount: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={newWithdrawal.notes}
                        onChange={(e) =>
                          setNewWithdrawal({ ...newWithdrawal, notes: e.target.value })
                        }
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Créer la demande
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
          <div className="flex items-center justify-between">
            <CardTitle>Historique des retraits</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
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
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="group border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <UserCircle className="h-8 w-8 text-primary/20 transition-colors group-hover:text-primary/40" />
                          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                        </div>
                        <div>
                          <p className="font-medium">{withdrawal.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {withdrawal.id}
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
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(withdrawal)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all"
                        >
                          <Pencil className="h-4 w-4 rotate-12 transition-all hover:rotate-45 hover:scale-110" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(withdrawal)}
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
            {filteredWithdrawals.length === 0 && (
              <div className="text-center text-muted-foreground p-4">
                Aucun retrait trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-2 text-blue-600">
                <Pencil className="h-5 w-5" />
              </div>
              Modifier le retrait
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Input
                value={editForm.clientName}
                onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Montant</Label>
              <Input
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmEdit}>Enregistrer les modifications</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
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
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="font-medium text-foreground">
                    Client : {selectedWithdrawal.clientName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Montant : {selectedWithdrawal.amount.toLocaleString()} €
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Date : {selectedWithdrawal.date}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Notes : {selectedWithdrawal.notes}
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

export default Withdrawals;
