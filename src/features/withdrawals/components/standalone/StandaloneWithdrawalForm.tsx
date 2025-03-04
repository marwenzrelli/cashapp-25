
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle } from "lucide-react";
import { DateField } from "../form-fields/DateField";
import { ClientSelectField } from "../form-fields/ClientSelectField";
import { AmountField } from "../form-fields/AmountField";
import { NotesField } from "../form-fields/NotesField";
import { Client } from "@/features/clients/types";

interface ExtendedClient extends Client {
  dateCreation: string;
}

export interface StandaloneWithdrawalFormProps {
  clients: ExtendedClient[];
  fetchWithdrawals: () => void;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
}

export const StandaloneWithdrawalForm: React.FC<StandaloneWithdrawalFormProps> = ({
  clients,
  fetchWithdrawals,
  refreshClientBalance,
}) => {
  const [newWithdrawal, setNewWithdrawal] = React.useState({
    clientId: "",
    amount: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async () => {
    // Basic validation
    if (!newWithdrawal.clientId || !newWithdrawal.amount) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // Submit logic would go here
      
      // Refresh data
      fetchWithdrawals();
      
      // Refresh client balance if needed
      if (newWithdrawal.clientId) {
        await refreshClientBalance(newWithdrawal.clientId);
      }
      
      // Reset form
      setNewWithdrawal({
        clientId: "",
        amount: "",
        notes: "",
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ArrowDownCircle className="h-5 w-5 text-red-500" />
        Nouveau retrait
      </h2>
      
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
        >
          <ArrowDownCircle className="h-4 w-4 mr-2" />
          Effectuer le retrait
        </Button>
      </div>
    </div>
  );
};
