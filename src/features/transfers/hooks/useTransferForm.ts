
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { format } from "date-fns";

export const useTransferForm = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fromClient, setFromClient] = useState("");
  const [toClient, setToClient] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [operationDate, setOperationDate] = useState(new Date());
  const [operationTime, setOperationTime] = useState(format(new Date(), "HH:mm:ss"));
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté pour accéder aux clients");
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('nom', { ascending: true });

      if (error) {
        console.error("Error fetching clients:", error);
        toast.error("Erreur lors du chargement des clients");
        return;
      }

      if (data) {
        setClients(data);
      }
    } catch (error) {
      console.error("Error in fetchClients:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté pour effectuer un virement");
        return;
      }

      if (!fromClient || !toClient || !amount || !reason) {
        toast.error("Veuillez remplir tous les champs");
        return;
      }

      const fromClientData = clients.find(c => c.id.toString() === fromClient);
      const toClientData = clients.find(c => c.id.toString() === toClient);

      if (!fromClientData || !toClientData) {
        toast.error("Client non trouvé");
        return;
      }

      const fromClientFullName = `${fromClientData.prenom} ${fromClientData.nom}`;
      const toClientFullName = `${toClientData.prenom} ${toClientData.nom}`;

      // Create a date with the exact time including seconds
      const [hours, minutes, seconds] = operationTime.split(':').map(Number);
      const exactDate = new Date(operationDate);
      exactDate.setHours(hours, minutes, seconds || 0);
      
      const { error } = await supabase
        .from('transfers')
        .insert({
          from_client: fromClientFullName,
          to_client: toClientFullName,
          amount: parseFloat(amount),
          reason,
          created_by: session.user.id,
          status: 'completed',
          operation_date: exactDate.toISOString() // Store with exact timestamp
        });

      if (error) {
        toast.error("Erreur lors de l'enregistrement du virement");
        console.error("Error creating transfer:", error);
        return;
      }

      toast.success("Virement effectué avec succès !");
      
      setFromClient("");
      setToClient("");
      setAmount("");
      setReason("");
      setOperationDate(new Date());
      setOperationTime(format(new Date(), "HH:mm:ss"));
      onSuccess?.();
    } catch (error) {
      console.error("Error in handleTransfer:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fromClient,
    setFromClient,
    toClient,
    setToClient,
    amount,
    setAmount,
    reason,
    setReason,
    operationDate,
    setOperationDate,
    operationTime,
    setOperationTime,
    clients,
    handleTransfer
  };
};
