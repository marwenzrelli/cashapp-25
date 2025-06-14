
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";
import { UserCircle, X } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { DateField } from "../form-fields/DateField";
import { format } from "date-fns";

interface StandaloneWithdrawalFormProps {
  clients: ExtendedClient[];
  onConfirm: (withdrawal: any) => Promise<boolean | void>;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const StandaloneWithdrawalForm: React.FC<StandaloneWithdrawalFormProps> = ({
  clients,
  onConfirm,
  refreshClientBalance,
  onSuccess,
  onCancel
}) => {
  const { currency } = useCurrency();
  const isMobile = useIsMobile();
  
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Find the selected client to display their balance
  const selectedClientData = clients.find(client => client.id.toString() === selectedClient);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient || !amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    
    try {
      const client = clients.find(c => c.id.toString() === selectedClient);
      
      if (!client) {
        throw new Error('Client non trouvé');
      }

      const withdrawal = {
        client_name: `${client.prenom} ${client.nom}`,
        amount: parseFloat(amount),
        date: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
        notes
      };

      const result = await onConfirm(withdrawal);
      
      if (result !== false && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-100 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-red-700">Nouveau retrait</CardTitle>
            <CardDescription>
              Effectuez un retrait pour un client
            </CardDescription>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-red-700 hover:bg-red-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
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
          
          <DateField 
            date={date} 
            onDateChange={setDate} 
            label="Date du retrait"
          />
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Input
              id="notes"
              placeholder="Entrez des notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className={`${onCancel ? "flex-1" : "w-full"} bg-red-600 hover:bg-red-700 ${isMobile ? "h-16 text-lg mt-4" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "En cours..." : "Effectuer le retrait"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
