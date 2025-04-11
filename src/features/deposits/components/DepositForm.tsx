
import React from "react";
import { useDepositForm } from "./deposit-form/useDepositForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";
import { Deposit } from "@/features/deposits/types";
import { UserCircle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { DatePickerField } from "../components/DatePickerField";

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
  const { currency } = useCurrency();
  const isMobile = useIsMobile();
  
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

  // Find the selected client to display their balance
  const selectedClientData = clients.find(client => client.id.toString() === selectedClient);

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
              <SelectTrigger id="client" className={isMobile ? "h-16 text-base" : ""}>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id.toString()} value={client.id.toString()}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-primary/50" />
                        <span>{client.prenom} {client.nom}</span>
                      </div>
                      <span className={`text-xs ${
                        client.solde >= 0 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        Solde: {client.solde.toLocaleString()} {currency}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedClientData && (
              <div className="mt-2 px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/20">
                <span className={`text-sm font-medium ${
                  selectedClientData.solde >= 0 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  Solde actuel: {selectedClientData.solde.toLocaleString()} {currency}
                </span>
              </div>
            )}
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
              className={isMobile ? "h-16 text-lg" : ""}
            />
          </div>
          
          <DatePickerField 
            date={date} 
            onDateChange={(newDate) => newDate && setDate(newDate)} 
            label="Date du versement"
            time={time}
            onTimeChange={setTime}
          />
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Input
              id="description"
              placeholder="Entrez une description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={isMobile ? "h-16 text-lg" : ""}
            />
          </div>
          
          <Button 
            type="submit" 
            className={`w-full bg-green-600 hover:bg-green-700 ${isMobile ? "h-16 text-lg mt-4" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "En cours..." : "Effectuer le versement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
