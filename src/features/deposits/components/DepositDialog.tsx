
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StandaloneDepositForm } from "./DepositForm";
import { Deposit } from "@/features/deposits/types";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  clients: ExtendedClient[];
  selectedClient: string;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
}

export const DepositDialog: React.FC<DepositDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  clients,
  selectedClient,
  refreshClientBalance
}) => {
  // Filter clients if a client is selected
  const filteredClients = selectedClient
    ? clients.filter(client => client.id.toString() === selectedClient)
    : clients;

  // Close dialog on success
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
        </DialogHeader>
        
        <StandaloneDepositForm 
          clients={filteredClients}
          onConfirm={onConfirm}
          refreshClientBalance={refreshClientBalance}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
