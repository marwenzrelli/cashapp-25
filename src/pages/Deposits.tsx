
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { DepositList } from "@/components/deposits/DepositList";
import { EditDepositDialog } from "@/components/deposits/EditDepositDialog";
import { DeleteDepositDialog } from "@/components/deposits/DeleteDepositDialog";
import { AISuggestions } from "@/components/deposits/AISuggestions";
import { type Deposit, type AISuggestion, type EditFormData, type NewDepositData } from "@/components/deposits/types";

const Deposits = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [newDeposit, setNewDeposit] = useState<NewDepositData>({
    clientName: "",
    amount: "",
    notes: "",
  });
  const [editForm, setEditForm] = useState<EditFormData>({
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

  const handleEditFormChange = (field: keyof EditFormData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
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
        <AISuggestions 
          suggestions={aiSuggestions} 
          onApplySuggestion={applySuggestion} 
        />

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
            <DepositList
              deposits={filteredDeposits}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {filteredDeposits.length === 0 && (
              <p className="text-center text-muted-foreground p-4">
                Aucun versement trouvé
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <EditDepositDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedDeposit={selectedDeposit}
        editForm={editForm}
        onEditFormChange={handleEditFormChange}
        onConfirm={confirmEdit}
      />

      <DeleteDepositDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedDeposit={selectedDeposit}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Deposits;
