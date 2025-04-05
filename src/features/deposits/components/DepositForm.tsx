
import React from "react";
import { useDepositForm } from "./deposit-form/useDepositForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";
import { Deposit } from "@/features/deposits/types";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface StandaloneDepositFormProps {
  clients: ExtendedClient[];
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
  onSuccess?: () => void; // Added success callback
}

export const StandaloneDepositForm: React.FC<StandaloneDepositFormProps> = ({
  clients,
  onConfirm,
  refreshClientBalance,
  onSuccess
}) => {
  const {
    selectedClient,
    setSelectedClient,
    amount,
    setAmount,
    date,
    setDate,
    time,
    setTime,
    description,
    setDescription,
    isLoading,
    handleSubmit
  } = useDepositForm({ clients, onConfirm, refreshClientBalance, onSuccess });

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-green-700">Nouveau versement</CardTitle>
        <CardDescription>
          Effectuez un versement pour un client
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Select 
              value={selectedClient} 
              onValueChange={setSelectedClient}
            >
              <SelectTrigger id="client">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id.toString()} value={client.id.toString()}>
                    {client.prenom} {client.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (TND)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date et heure du versement</Label>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline" 
                      className="w-full justify-start text-left font-normal relative pl-10"
                    >
                      <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      {date ? format(date, "dd/MM/yyyy", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="relative">
                <Input
                  id="time"
                  type="time"
                  step="1"
                  className="pl-10 border rounded-lg bg-gray-50"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Cette date sera utilisée comme date d'opération personnalisée (heure locale).
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Input
              id="description"
              placeholder="Entrez une description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700" 
            disabled={isLoading}
          >
            {isLoading ? "En cours..." : "Effectuer le versement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
