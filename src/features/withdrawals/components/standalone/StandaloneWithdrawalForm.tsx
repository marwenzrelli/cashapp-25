
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClientSelectField } from "../form-fields/ClientSelectField";
import { AmountField } from "../form-fields/AmountField";
import { NotesField } from "../form-fields/NotesField";
import { DateField } from "../form-fields/DateField";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ExtendedClient } from "../../hooks/form/withdrawalFormTypes";
import { toast } from "sonner";
import { ensureValidISODate } from "../../hooks/utils/formatUtils";

interface StandaloneWithdrawalFormProps {
  clients: ExtendedClient[];
  onConfirm: (withdrawal: any) => Promise<boolean | void>;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
  onSuccess?: () => void; // Added success callback
}

export const StandaloneWithdrawalForm: React.FC<StandaloneWithdrawalFormProps> = ({
  clients,
  onConfirm,
  refreshClientBalance,
  onSuccess
}) => {
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId || !amount) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const client = clients.find(c => c.id.toString() === clientId);
      if (!client) {
        toast.error("Client non trouvé");
        return;
      }

      const clientName = `${client.prenom} ${client.nom}`;
      const operationDate = ensureValidISODate(date);
      const amountValue = parseFloat(amount.replace(',', '.'));
      
      if (isNaN(amountValue) || amountValue <= 0) {
        toast.error("Le montant doit être un nombre positif valide");
        return;
      }
      
      console.log("Submitting withdrawal form with:", {
        clientName,
        amount: amountValue,
        notes,
        date: operationDate
      });
      
      const withdrawalResult = await onConfirm({
        client_name: clientName,
        amount: amountValue.toString(),
        notes,
        date: operationDate
      });
      
      if (withdrawalResult !== false) {
        // Reset form on success
        setClientId("");
        setAmount("");
        setNotes("");
        setDate(new Date().toISOString());
        
        // Refresh client balance
        if (client.id) {
          await refreshClientBalance(client.id.toString());
        }
        
        toast.success("Retrait effectué avec succès");
        
        // Call onSuccess callback if provided to close the dialog
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast.error("Erreur lors du traitement du retrait");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-red-50 to-amber-50 border-red-100 shadow-md w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-red-700">Nouveau retrait</CardTitle>
        <CardDescription>
          Effectuez un retrait pour un client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientSelectField
            value={clientId}
            onChange={setClientId}
            clients={clients}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AmountField
              value={amount}
              onChange={setAmount}
            />
            
            <DateField
              value={date}
              onChange={setDate}
            />
          </div>
          
          <NotesField
            value={notes}
            onChange={setNotes}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700" 
            disabled={isLoading}
          >
            {isLoading ? "En cours..." : "Effectuer le retrait"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
