
import React, { useState } from "react";
import { format } from "date-fns";
import { ExtendedClient } from "@/features/withdrawals/components/standalone/StandaloneWithdrawalForm";
import { Deposit } from "@/features/deposits/types";
import { toast } from "sonner";
import { DateTimeSection } from "./DateTimeSection";
import { ClientSelectSection } from "./ClientSelectSection";
import { AmountSection } from "./AmountSection";
import { DescriptionSection } from "./DescriptionSection";
import { SubmitButton } from "./SubmitButton";

interface DepositFormContentProps {
  clients: ExtendedClient[];
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: () => Promise<boolean>;
}

export const DepositFormContent = ({
  clients,
  onConfirm,
  refreshClientBalance
}: DepositFormContentProps) => {
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), "HH:mm:ss")); // Include seconds
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedClientData = clients.find(c => c.id.toString() === selectedClient);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !amount) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const client = clients.find(c => c.id.toString() === selectedClient);
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
      if (result !== false) {
        console.log("Rafraîchissement du solde après dépôt");
        await refreshClientBalance();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DateTimeSection
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
      />

      <ClientSelectSection
        clients={clients}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedClientData={selectedClientData}
      />

      <AmountSection 
        amount={amount} 
        setAmount={setAmount} 
      />

      <DescriptionSection
        description={description}
        setDescription={setDescription}
      />

      <SubmitButton isLoading={isLoading} />
    </form>
  );
};
