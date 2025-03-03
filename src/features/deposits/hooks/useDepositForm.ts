
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { type Deposit } from "@/features/deposits/types";
import { useClients } from "@/features/clients/hooks/useClients";

export const useDepositForm = (onConfirm: (deposit: Deposit) => Promise<void>, onOpenChange: (open: boolean) => void) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { clients, fetchClients } = useClients();

  useEffect(() => {
    setIsValid(!!selectedClient && !!amount && parseFloat(amount) > 0);
  }, [selectedClient, amount]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const resetForm = () => {
    setSelectedClient("");
    setAmount("");
    setDescription("");
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const selectedClientData = clients.find(c => c.id.toString() === selectedClient);
      if (!selectedClientData) {
        toast.error("Client non trouvé");
        return;
      }

      const newDeposit: Omit<Deposit, 'id' | 'status' | 'created_at' | 'created_by'> = {
        client_name: `${selectedClientData.prenom} ${selectedClientData.nom}`,
        amount: Number(amount),
        date: format(date, "yyyy-MM-dd"),
        description
      };

      await onConfirm(newDeposit as Deposit);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onOpenChange(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error submitting deposit:", error);
      toast.error("Une erreur s'est produite lors de l'enregistrement du versement");
      setIsLoading(false);
    }
  };

  return {
    formState: {
      selectedClient,
      amount,
      date,
      description,
    },
    setSelectedClient,
    setAmount,
    setDescription,
    handleDateChange,
    handleSubmit,
    isLoading,
    isValid,
    showSuccess,
    clients,
    fetchClients
  };
};
