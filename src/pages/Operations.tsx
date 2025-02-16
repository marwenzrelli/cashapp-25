
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Operation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  date: string;
  description: string;
  status: "completed" | "pending" | "failed";
}

const Operations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [editForm, setEditForm] = useState({
    type: "",
    amount: "",
    description: "",
  });

  const [operations, setOperations] = useState<Operation[]>([
    {
      id: "1",
      type: "deposit",
      amount: 1000,
      date: "2024-02-23",
      description: "Dépôt initial",
      status: "completed",
    },
    {
      id: "2",
      type: "withdrawal",
      amount: 500,
      date: "2024-02-22",
      description: "Retrait ATM",
      status: "completed",
    },
    {
      id: "3",
      type: "transfer",
      amount: 750,
      date: "2024-02-21",
      description: "Virement mensuel",
      status: "pending",
    },
  ]);

  const handleEdit = (operation: Operation) => {
    setSelectedOperation(operation);
    setEditForm({
      type: operation.type,
      amount: operation.amount.toString(),
      description: operation.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDeleteDialogOpen(true);
  };

  const confirmEdit = () => {
    if (!selectedOperation) return;

    setOperations((prev) =>
      prev.map((operation) =>
        operation.id === selectedOperation.id
          ? {
              ...operation,
              type: editForm.type as Operation["type"],
              amount: parseFloat(editForm.amount),
              description: editForm.description,
            }
          : operation
      )
    );

    setIsEditDialogOpen(false);
    toast.success("Opération modifiée avec succès");
  };

  const confirmDelete = () => {
    if (!selectedOperation) return;

    setOperations((prev) =>
      prev.filter((operation) => operation.id !== selectedOperation.id)
    );

    setIsDeleteDialogOpen(false);
    toast.success("Opération supprimée avec succès");
  };

  const getStatusStyle = (status: Operation["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-600 dark:bg-green-950/50";
      case "pending":
        return "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50";
      case "failed":
        return "bg-red-50 text-red-600 dark:bg-red-950/50";
    }
  };

  const getTypeStyle = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/50";
      case "withdrawal":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/50";
      case "transfer":
        return "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50";
    }
  };

  const filteredOperations = operations.filter(
    (operation) =>
      operation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Opérations</h1>
        <p className="text-muted-foreground">
          Gérez toutes vos opérations bancaires
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des opérations</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle opération
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOperations.map((operation) => (
              <div
                key={operation.id}
                className="group relative rounded-lg border bg-card p-4 hover:shadow-md transition-all"
              >
                <div className="absolute -left-px top-4 bottom-4 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeStyle(operation.type)}`}>
                      {operation.type}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{operation.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {operation.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {operation.amount.toLocaleString()} €
                      </div>
                      <div className={`text-sm px-2 py-0.5 rounded ${getStatusStyle(operation.status)}`}>
                        {operation.status}
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(operation)}
                        className="hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all"
                      >
                        <Pencil className="h-4 w-4 rotate-12 transition-all hover:rotate-45 hover:scale-110" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(operation)}
                        className="hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="h-4 w-4 transition-all hover:-translate-y-1 hover:scale-110" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredOperations.length === 0 && (
              <div className="text-center py-12">
                <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Aucune opération trouvée</h3>
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
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-2 text-blue-600">
                <Pencil className="h-5 w-5" />
              </div>
              Modifier l'opération
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
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
              <p>Êtes-vous sûr de vouloir supprimer cette opération ?</p>
              {selectedOperation && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="font-medium text-foreground">
                    Type : {selectedOperation.type}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Description : {selectedOperation.description}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Montant : {selectedOperation.amount.toLocaleString()} €
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Date : {selectedOperation.date}
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

export default Operations;
