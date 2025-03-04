
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Client } from "@/features/clients/types";
import { Deposit } from "@/features/deposits/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ScrollText, UserCircle, BadgeDollarSign, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientBalanceDisplay } from "@/features/clients/components/client-list/ClientBalanceDisplay";
import { useCurrency } from "@/contexts/CurrencyContext";

interface StandaloneDepositFormProps {
  clients: Client[];
  onConfirm: (deposit: Deposit) => Promise<void>;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
}

export const StandaloneDepositForm = ({
  clients,
  onConfirm,
  refreshClientBalance
}: StandaloneDepositFormProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currency } = useCurrency();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !amount) return;

    setIsLoading(true);
    try {
      const client = clients.find(c => c.id.toString() === selectedClient);
      if (!client) return;

      const newDeposit: Partial<Deposit> = {
        client_name: `${client.prenom} ${client.nom}`,
        amount: parseFloat(amount),
        date: format(date, "yyyy-MM-dd"),
        description
      };

      await onConfirm(newDeposit as Deposit);
      await refreshClientBalance(selectedClient);

      setSelectedClient("");
      setAmount("");
      setDescription("");
      setDate(new Date());
    } catch (error) {
      console.error("Error submitting deposit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Find the selected client to display their balance
  const selectedClientData = clients.find(c => c.id.toString() === selectedClient);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau versement</CardTitle>
        <CardDescription>
          Créez un nouveau versement pour un client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id.toString()} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-primary/50" />
                      <span>{client.prenom} {client.nom}</span>
                    </div>
                    <div className={`font-mono text-sm ${
                      client.solde >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {client.solde.toLocaleString()} {currency}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedClientData && (
              <div className="mt-2 p-2 bg-muted/50 rounded-md flex items-center justify-between">
                <span className="text-sm">Solde actuel:</span>
                <ClientBalanceDisplay solde={selectedClientData.solde} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date du versement</Label>
            <Input
              id="date"
              type="date"
              value={format(date, "yyyy-MM-dd")}
              onChange={(e) => {
                if (e.target.value) {
                  setDate(new Date(e.target.value));
                }
              }}
              className="transition-all focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <div className="relative">
              <BadgeDollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9 transition-all focus-visible:ring-primary/50"
              />
              <span className="absolute right-3 top-3 text-muted-foreground">
                {currency}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="relative">
              <ScrollText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="description"
                placeholder="Description du versement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="pl-9 transition-all focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "En cours..." : "Enregistrer le versement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
