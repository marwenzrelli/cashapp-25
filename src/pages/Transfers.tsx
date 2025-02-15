
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
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

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

  // Simulated AI suggestions (à remplacer par de vraies suggestions basées sur l'IA)
  const suggestions: Suggestion[] = [
    {
      id: "1",
      fromClient: "Jean Dupont",
      toClient: "Marie Martin",
      amount: 1500,
      reason: "Paiement mensuel",
    },
    {
      id: "2",
      fromClient: "Pierre Durant",
      toClient: "Sophie Bernard",
      amount: 750,
      reason: "Remboursement",
    },
  ];

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Transfert effectué avec succès !");
      
      // Réinitialiser le formulaire
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
    </div>
  );
};

export default Transfers;
