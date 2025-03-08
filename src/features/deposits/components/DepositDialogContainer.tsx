
import React from "react";
import { DepositDialog } from "./DepositDialog";
import { Deposit } from "@/features/deposits/types";
import { StandaloneDepositForm } from "./DepositForm";
import { Client } from "@/features/clients/types";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";

interface DepositDialogContainerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  clients: Client[];
  selectedClient: Client | null;
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
}

export const DepositDialogContainer: React.FC<DepositDialogContainerProps> = ({
  open,
  setOpen,
  clients,
  selectedClient,
  onConfirm,
  refreshClientBalance
}) => {
  // Convert clients to ExtendedClients
  const extendedClients: ExtendedClient[] = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  const handleConfirm = async (deposit: Deposit): Promise<boolean | void> => {
    try {
      const result = await onConfirm(deposit);
      if (result !== false) {
        setOpen(false);
      }
      return result;
    } catch (error) {
      console.error("Error confirming deposit:", error);
      return false;
    }
  };

  const handleRefreshClientBalance = async (clientId: string): Promise<boolean | void> => {
    try {
      return await refreshClientBalance(clientId);
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      return false;
    }
  };

  return (
    <DepositDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={handleConfirm}
      clients={extendedClients}
      selectedClient={selectedClient ? selectedClient.id.toString() : ""}
      refreshClientBalance={handleRefreshClientBalance}
    />
  );
};
