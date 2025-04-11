
import { useState, useCallback } from "react";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";
import { Deposit } from "@/features/deposits/types";
import { format } from "date-fns";

interface UseDepositFormProps {
  clients: ExtendedClient[];
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
  onSuccess?: () => void;
}

export const useDepositForm = ({
  clients,
  onConfirm,
  refreshClientBalance,
  onSuccess
}: UseDepositFormProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  });
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!selectedClient || !amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsLoading(true);
    
    try {
      const client = clients.find(c => c.id.toString() === selectedClient);
      
      if (!client) {
        throw new Error('Client non trouvé');
      }

      // Combine date and time
      const combinedDate = new Date(date);
      if (time) {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        combinedDate.setHours(hours || 0, minutes || 0, seconds || 0);
      }
      
      const newDeposit: Deposit = {
        id: 0, // This will be assigned by the database
        client_id: parseInt(selectedClient),
        client_name: `${client.prenom} ${client.nom}`,
        amount: parseFloat(amount),
        date: format(combinedDate, "yyyy-MM-dd'T'HH:mm:ss"),
        description: description,
        created_at: new Date().toISOString(),
        status: "completed",
        updated_at: new Date().toISOString(),
      };

      console.log("Submitting deposit:", newDeposit);
      const result = await onConfirm(newDeposit);
      
      if (result !== false) {
        // Refresh client balance
        if (client.id) {
          await refreshClientBalance(client.id.toString());
        }
        
        // Reset form
        setSelectedClient("");
        setAmount("");
        setDate(new Date());
        const now = new Date();
        setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
        setDescription("");
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error submitting deposit:', error);
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
