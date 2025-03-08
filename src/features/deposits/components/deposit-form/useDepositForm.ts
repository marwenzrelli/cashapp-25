
import { useState } from "react";
import { format } from "date-fns";
import { Deposit } from "@/features/deposits/types";
import { toast } from "sonner";

interface UseDepositFormProps {
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
}

export const useDepositForm = ({ onConfirm, refreshClientBalance }: UseDepositFormProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), "HH:mm:ss")); // Include seconds
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !amount) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const client = clients?.find(c => c.id.toString() === selectedClient);
      if (!client) {
        toast.error("Client non trouvé");
        return;
      }

      // Split time string to get hours, minutes, and seconds
      const [hours, minutes, seconds] = time.split(':').map(Number);
      const depositDateTime = new Date(date);
      depositDateTime.setHours(hours, minutes, seconds || 0); // Set seconds if available

      const newDeposit: Partial<Deposit> = {
        client_name: `${client.prenom} ${client.nom}`,
        amount: parseFloat(amount),
        date: format(depositDateTime, "yyyy-MM-dd'T'HH:mm:ss"), // Include seconds
        description
      };

      // Effectuer le dépôt
      const result = await onConfirm(newDeposit as Deposit);
      
      // Si le dépôt a réussi, on rafraîchit le solde du client
      if (result !== false && selectedClient) {
        console.log("Rafraîchissement du solde après dépôt pour le client:", selectedClient);
        await refreshClientBalance(selectedClient);
      }

      // Réinitialiser le formulaire
      setSelectedClient("");
      setAmount("");
      setDescription("");
      setDate(new Date());
      setTime(format(new Date(), "HH:mm:ss")); // Reset with seconds
      
      toast.success("Versement effectué avec succès");
    } catch (error) {
      console.error("Error submitting deposit:", error);
      toast.error("Erreur lors du traitement du versement");
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
