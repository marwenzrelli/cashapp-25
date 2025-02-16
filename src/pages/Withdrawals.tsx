
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowDownCircle, Plus, Sparkles, Search, UserCircle, AlertTriangle } from "lucide-react";
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
          <CardTitle>Historique des retraits</CardTitle>
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
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
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
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredWithdrawals.length === 0 && (
              <p className="text-center text-muted-foreground p-4">
                Aucun retrait trouvé
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdrawals;
