
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";

interface TransferFormProps {
  onSuccess?: () => void;
}

export const TransferForm = ({ onSuccess }: TransferFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fromClient, setFromClient] = useState("");
  const [toClient, setToClient] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté pour accéder aux clients");
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('nom', { ascending: true });

      if (error) {
        console.error("Error fetching clients:", error);
        toast.error("Erreur lors du chargement des clients");
        return;
      }

      if (data) {
        setClients(data);
      }
    } catch (error) {
      console.error("Error in fetchClients:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté pour effectuer un virement");
        return;
      }

      if (!fromClient || !toClient || !amount || !reason) {
        toast.error("Veuillez remplir tous les champs");
        return;
      }

      const fromClientData = clients.find(c => c.id.toString() === fromClient);
      const toClientData = clients.find(c => c.id.toString() === toClient);

      if (!fromClientData || !toClientData) {
        toast.error("Client non trouvé");
        return;
      }

      const fromClientFullName = `${fromClientData.prenom} ${fromClientData.nom}`;
      const toClientFullName = `${toClientData.prenom} ${toClientData.nom}`;

      const { error } = await supabase
        .from('transfers')
        .insert({
          from_client: fromClientFullName,
          to_client: toClientFullName,
          amount: parseFloat(amount),
          reason,
          created_by: session.user.id,
          status: 'completed'
        });

      if (error) {
        toast.error("Erreur lors de l'enregistrement du virement");
        console.error("Error creating transfer:", error);
        return;
      }

      toast.success("Virement effectué avec succès !");
      
      setFromClient("");
      setToClient("");
      setAmount("");
      setReason("");
      onSuccess?.();
    } catch (error) {
      console.error("Error in handleTransfer:", error);
      toast.error("Une erreur est survenue");
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
                {clients.map((client) => (
                  <SelectItem 
                    key={client.id} 
                    value={client.id.toString()}
                  >
                    {client.prenom} {client.nom} ({client.solde} TND)
                  </SelectItem>
                ))}
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
                {clients.map((client) => (
                  <SelectItem 
                    key={client.id} 
                    value={client.id.toString()}
                    disabled={client.id.toString() === fromClient}
                  >
                    {client.prenom} {client.nom} ({client.solde} TND)
                  </SelectItem>
                ))}
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
