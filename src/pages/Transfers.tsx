import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  ArrowLeftRight, 
  ClockIcon, 
  Search,
  Pencil,
  Trash2
} from "lucide-react";

interface Transfer {
  id: string;
  fromClient: string;
  toClient: string;
  amount: number;
  date: string;
  reason: string;
}

interface Suggestion {
  id: string;
  fromClient: string;
  toClient: string;
  amount: number;
  reason: string;
}

const Transfers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fromClient, setFromClient] = useState("");
  const [toClient, setToClient] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fromClient: "",
    toClient: "",
    amount: "",
    reason: "",
  });

  const [transfers, setTransfers] = useState<Transfer[]>([
    {
      id: "1",
      fromClient: "Jean Dupont",
      toClient: "Marie Martin",
      amount: 1500,
      date: "2024-02-23",
      reason: "Paiement mensuel",
    },
    {
      id: "2",
      fromClient: "Marie Martin",
      toClient: "Pierre Durant",
      amount: 750,
      date: "2024-02-22",
      reason: "Remboursement",
    },
    {
      id: "3",
      fromClient: "Pierre Durant",
      toClient: "Jean Dupont",
      amount: 2000,
      date: "2024-02-21",
      reason: "Investissement",
    },
  ]);

  const suggestions: Suggestion[] = [
    {
      id: "1",
      fromClient: "Jean Dupont",
      toClient: "Marie Martin",
      amount: 1500,
      reason: "Paiement mensuel récurrent",
    },
    {
      id: "2",
      fromClient: "Marie Martin",
      toClient: "Pierre Durant",
      amount: 800,
      reason: "Remboursement prévu",
    },
  ];

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Transfert effectué avec succès !");
      
      setFromClient("");
      setToClient("");
      setAmount("");
      setReason("");
    } catch (error) {
      toast.error("Erreur lors du transfert");
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    setFromClient(suggestion.fromClient);
    setToClient(suggestion.toClient);
    setAmount(suggestion.amount.toString());
    setReason(suggestion.reason);
    toast.success("Suggestion appliquée !");
  };

  const handleEdit = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setEditForm({
      fromClient: transfer.fromClient,
      toClient: transfer.toClient,
      amount: transfer.amount.toString(),
      reason: transfer.reason,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setIsDeleteDialogOpen(true);
  };

  const confirmEdit = () => {
    if (!selectedTransfer) return;

    setTransfers((prev) =>
      prev.map((transfer) =>
        transfer.id === selectedTransfer.id
          ? {
              ...transfer,
              fromClient: editForm.fromClient,
              toClient: editForm.toClient,
              amount: parseFloat(editForm.amount),
              reason: editForm.reason,
            }
          : transfer
      )
    );

    setIsEditDialogOpen(false);
    toast.success("Virement modifié avec succès");
  };

  const confirmDelete = () => {
    if (!selectedTransfer) return;

    setTransfers((prev) =>
      prev.filter((transfer) => transfer.id !== selectedTransfer.id)
    );

    setIsDeleteDialogOpen(false);
    toast.success("Virement supprimé avec succès");
  };

  const filteredTransfers = transfers.filter(
    (transfer) =>
      transfer.fromClient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toClient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Virements</h1>
        <p className="text-muted-foreground">
          Effectuez des virements entre comptes avec assistance IA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nouveau virement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromClient">Compte émetteur</Label>
                <Select value={fromClient} onValueChange={setFromClient}>
                  <SelectTrigger id="fromClient">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jean Dupont">Jean Dupont</SelectItem>
                    <SelectItem value="Marie Martin">Marie Martin</SelectItem>
                    <SelectItem value="Pierre Durant">Pierre Durant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toClient">Compte bénéficiaire</Label>
                <Select value={toClient} onValueChange={setToClient}>
                  <SelectTrigger id="toClient">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jean Dupont">Jean Dupont</SelectItem>
                    <SelectItem value="Marie Martin">Marie Martin</SelectItem>
                    <SelectItem value="Pierre Durant">Pierre Durant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motif</Label>
                <Input
                  id="reason"
                  placeholder="Motif du virement"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    Effectuer le virement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Suggestions intelligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor
-pointer"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {suggestion.fromClient} → {suggestion.toClient}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.reason}
                    </p>
                  </div>
                  <p className="font-medium">{suggestion.amount.toLocaleString()} €</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary" />
              Historique des virements
            </CardTitle>
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
          <div className="space-y-6">
            {filteredTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="group relative rounded-lg border bg-card p-6 transition-all hover:shadow-md"
              >
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-16 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <ArrowLeftRight className="h-6 w-6" />
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        {transfer.date}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-muted-foreground">De:</span> {transfer.fromClient}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">À:</span> {transfer.toClient}
                      </div>
                      <p className="text-sm text-muted-foreground">{transfer.reason}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-lg font-semibold text-primary">
                        {transfer.amount.toLocaleString()} €
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {transfer.id}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(transfer)}
                        className="h-8 w-8 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-500"
                      >
                        <Pencil className="h-4 w-4 rotate-12 transition-transform hover:rotate-45" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transfer)}
                        className="h-8 w-8 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-500"
                      >
                        <Trash2 className="h-4 w-4 transition-transform hover:-translate-y-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredTransfers.length === 0 && (
              <div className="text-center py-12">
                <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Aucun virement trouvé</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Modifiez vos critères de recherche pour voir plus de résultats.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le virement</DialogTitle>
            <DialogDescription>
              Modifiez les informations du virement ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Compte émetteur</Label>
              <Select
                value={editForm.fromClient}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, fromClient: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jean Dupont">Jean Dupont</SelectItem>
                  <SelectItem value="Marie Martin">Marie Martin</SelectItem>
                  <SelectItem value="Pierre Durant">Pierre Durant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Compte bénéficiaire</Label>
              <Select
                value={editForm.toClient}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, toClient: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jean Dupont">Jean Dupont</SelectItem>
                  <SelectItem value="Marie Martin">Marie Martin</SelectItem>
                  <SelectItem value="Pierre Durant">Pierre Durant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Montant</Label>
              <Input
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Motif</Label>
              <Input
                value={editForm.reason}
                onChange={(e) =>
                  setEditForm({ ...editForm, reason: e.target.value })
                }
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
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce virement ? Cette action est irréversible.
              {selectedTransfer && (
                <div className="mt-4 p-4 rounded-lg border bg-muted">
                  <div className="font-medium">Détails du virement :</div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>De : {selectedTransfer.fromClient}</p>
                    <p>À : {selectedTransfer.toClient}</p>
                    <p>Montant : {selectedTransfer.amount.toLocaleString()} €</p>
                    <p>Date : {selectedTransfer.date}</p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transfers;
