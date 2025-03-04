
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Client } from "@/features/clients/types";
import { Deposit } from "@/features/deposits/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarIcon, Wallet } from "lucide-react";
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
                    <div className="flex-1">
                      {client.prenom} {client.nom}
                    </div>
                    <div className="flex items-center text-sm">
                      <Wallet className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className={`${client.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {client.solde.toLocaleString()} {currency}
                      </span>
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
            <Label htmlFor="amount">Montant</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Montant"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "En cours..." : "Enregistrer le versement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
