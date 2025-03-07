
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle } from "lucide-react";
import { DateField } from "../form-fields/DateField";
import { ClientSelectField } from "../form-fields/ClientSelectField";
import { AmountField } from "../form-fields/AmountField";
import { NotesField } from "../form-fields/NotesField";
import { Client } from "@/features/clients/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

// Define the ExtendedClient interface that includes dateCreation property
export interface ExtendedClient extends Client {
  dateCreation: string;
}

export interface StandaloneWithdrawalFormProps {
  clients: ExtendedClient[];
  onConfirm: (withdrawal: any) => Promise<boolean | void>; // Updated return type
  refreshClientBalance: (clientId?: string) => Promise<boolean>;
}

export const StandaloneWithdrawalForm: React.FC<StandaloneWithdrawalFormProps> = ({
  clients,
  onConfirm,
  refreshClientBalance,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newWithdrawal, setNewWithdrawal] = useState({
    clientId: "",
    amount: "",
    notes: "",
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
  });

  const handleSubmit = async () => {
    if (!newWithdrawal.clientId || !newWithdrawal.amount) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const selectedClient = clients.find(client => client.id.toString() === newWithdrawal.clientId);
      if (!selectedClient) {
        toast.error("Client non trouvé");
        return;
      }

      const amount = parseFloat(newWithdrawal.amount);
      if (isNaN(amount)) {
        toast.error("Montant invalide");
        return;
      }

      const dateObj = new Date(newWithdrawal.date);
      
      const withdrawal = {
        client_name: `${selectedClient.prenom} ${selectedClient.nom}`,
        amount: amount,
        date: dateObj.toISOString(),
        notes: newWithdrawal.notes
      };

      // Effectuer le retrait
      const result = await onConfirm(withdrawal);
      
      // Si le retrait a réussi, on rafraîchit le solde du client
      if (result !== false && newWithdrawal.clientId) {
        console.log("Rafraîchissement du solde après retrait pour le client:", newWithdrawal.clientId);
        await refreshClientBalance(newWithdrawal.clientId);
      }
      
      // Réinitialiser le formulaire
      setNewWithdrawal({
        clientId: "",
        amount: "",
        notes: "",
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      });
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      toast.error("Erreur lors du traitement du retrait");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-100 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-red-700">Nouveau retrait</CardTitle>
        <CardDescription>
          Enregistrez un nouveau retrait pour un client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <DateField
            value={newWithdrawal.date}
            onChange={(value) => setNewWithdrawal({ ...newWithdrawal, date: value })}
            id="standalone-date"
          />

          <ClientSelectField
            value={newWithdrawal.clientId}
            onChange={(value) => setNewWithdrawal({ ...newWithdrawal, clientId: value })}
            clients={clients}
            id="standalone-clientId"
          />

          <AmountField
            value={newWithdrawal.amount}
            onChange={(value) => setNewWithdrawal({ ...newWithdrawal, amount: value })}
            id="standalone-amount"
          />

          <NotesField
            value={newWithdrawal.notes}
            onChange={(value) => setNewWithdrawal({ ...newWithdrawal, notes: value })}
            id="standalone-notes"
          />

          <Button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white w-full mt-4"
            disabled={isLoading}
          >
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            {isLoading ? "En cours..." : "Effectuer le retrait"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
