
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TransferFormProps {
  onSuccess?: () => void;
}

export const TransferForm = ({ onSuccess }: TransferFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fromClient, setFromClient] = useState("");
  const [toClient, setToClient] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

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
      onSuccess?.();
    } catch (error) {
      toast.error("Erreur lors du transfert");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};
