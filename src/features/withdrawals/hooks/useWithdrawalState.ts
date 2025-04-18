
import { useState } from "react";
import { Withdrawal } from "../types";
import { Client } from "@/features/clients/types";
import { ExtendedClient } from "../hooks/form/withdrawalFormTypes";

export const useWithdrawalState = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleNewWithdrawal = () => {
    setSelectedWithdrawal(null);
    setIsEditing(false);
    setShowDialog(true);
  };

  const handleEdit = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setSelectedClient(withdrawal.client_name);
    setIsEditing(true);
    setShowDialog(true);
  };

  const findClientById = (clients: Client[], clientName: string) => {
    const client = clients.find(c => `${c.prenom} ${c.nom}` === clientName);
    return client ? {
      ...client,
      dateCreation: client.date_creation || new Date().toISOString()
    } : null;
  };

  return {
    showDialog,
    setShowDialog,
    selectedClient,
    setSelectedClient,
    selectedWithdrawal,
    setSelectedWithdrawal,
    isEditing,
    setIsEditing,
    handleNewWithdrawal,
    handleEdit,
    findClientById
  };
};
