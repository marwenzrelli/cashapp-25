
import { useState } from "react";
import { format } from "date-fns";
import { Deposit } from "@/features/deposits/types";
import { toast } from "sonner";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { createISOString } from "../../hooks/utils/dateUtils";

interface UseDepositFormProps {
  clients: ExtendedClient[];
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
  onSuccess?: () => void; // Added success callback
}

export const useDepositForm = ({ clients, onConfirm, refreshClientBalance, onSuccess }: UseDepositFormProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), "HH:mm:ss")); // Always include seconds in the state
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

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

      // Create ISO string from date and time, ensuring proper format
      const operationDate = createISOString(
        format(date, "yyyy-MM-dd"), 
        time
      );

      if (!operationDate) {
        toast.error("Format de date ou d'heure invalide");
        return;
      }

      const newDeposit: Partial<Deposit> = {
        client_name: `${client.prenom} ${client.nom}`,
        client_id: client.id, // Include the client ID in the deposit
        amount: parseFloat(amount),
        date: operationDate,
        description
      };

      console.log("Envoi du dépôt avec date:", {
        dateObject: date,
        timeString: time,
        resultIso: operationDate,
        isMobile
      });

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
      
      // Call onSuccess callback if provided to close the dialog
      if (onSuccess && result !== false) {
        onSuccess();
      }
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
