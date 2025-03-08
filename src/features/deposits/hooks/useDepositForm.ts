
import { useState, useCallback } from "react";
import { Client } from "@/features/clients/types";
import { Deposit } from "@/components/deposits/types";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useDepositForm = (
  onConfirm: (deposit: Deposit) => Promise<boolean | void>,
  onOpenChange: (open: boolean) => void
) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('date_creation', { ascending: false });
      
      if (error) {
        console.error('Error fetching clients:', error);
        return;
      }
      
      setClients(data || []);
    } catch (error) {
      console.error('Error in fetchClients:', error);
    }
  }, []);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const isValid = Boolean(selectedClient && amount && parseFloat(amount) > 0);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!isValid) return;

    setIsLoading(true);
    
    try {
      const client = clients.find(c => c.id.toString() === selectedClient);
      
      if (!client) {
        throw new Error('Client non trouvé');
      }

      const newDeposit: Partial<Deposit> = {
        client_name: `${client.prenom} ${client.nom}`,
        amount: parseFloat(amount),
        date: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
        description
      };

      const result = await onConfirm(newDeposit as Deposit);
      
      if (result !== false) {
        setShowSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          setSelectedClient("");
          setAmount("");
          setDate(new Date());
          setDescription("");
          setShowSuccess(false);
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting deposit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formState = {
    selectedClient,
    amount,
    date,
    description
  };

  return {
    formState,
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
