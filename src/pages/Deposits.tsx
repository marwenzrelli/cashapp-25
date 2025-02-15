
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowUpCircle, Plus, Sparkles, Search, UserCircle } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [newDeposit, setNewDeposit] = useState({
    clientName: "",
    amount: "",
    notes: "",
  });

  // Données de test
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

  // Suggestions IA simulées
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
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
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
    </div>
  );
};

export default Deposits;
