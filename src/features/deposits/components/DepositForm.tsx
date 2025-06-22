
import React from "react";
import { useDepositForm } from "./deposit-form/useDepositForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";
import { Deposit } from "@/features/deposits/types";
import { UserCircle, X } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { DatePickerField } from "../components/DatePickerField";

interface StandaloneDepositFormProps {
  clients: ExtendedClient[];
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const StandaloneDepositForm: React.FC<StandaloneDepositFormProps> = ({
  clients,
  onConfirm,
  refreshClientBalance,
  onSuccess,
  onCancel
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
  
  // Check if we have only one client (specific client context)
  const isSpecificClient = clients.length === 1;
  const singleClient = isSpecificClient ? clients[0] : null;

  // Auto-select the single client if we're in specific client context
  React.useEffect(() => {
    if (isSpecificClient && singleClient && !selectedClient) {
      setSelectedClient(singleClient.id.toString());
    }
  }, [isSpecificClient, singleClient, selectedClient, setSelectedClient]);

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-green-700">Nouveau versement</CardTitle>
            <CardDescription>
              {isSpecificClient && singleClient 
                ? `Effectuez un versement pour ${singleClient.prenom} ${singleClient.nom}`
                : "Effectuez un versement pour un client"
              }
            </CardDescription>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-green-700 hover:bg-green-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Only show client selection if we have multiple clients */}
          {!isSpecificClient && (
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
            </div>
          )}

          {/* Show client info for specific client context */}
          {isSpecificClient && singleClient && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <UserCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    {singleClient.prenom} {singleClient.nom}
                  </h3>
                  <p className={`text-sm font-medium ${
                    singleClient.solde >= 0 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    Solde actuel: {singleClient.solde.toLocaleString()} {currency}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Show balance info for multi-client context */}
          {!isSpecificClient && selectedClientData && (
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
          
          <div className="pt-2 flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Annuler
              </Button>
            )}
            <Button 
              type="submit" 
              className={`${onCancel ? "flex-1" : "w-full"} bg-green-600 hover:bg-green-700 ${isMobile ? "h-16 text-lg mt-4" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "En cours..." : "Effectuer le versement"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
