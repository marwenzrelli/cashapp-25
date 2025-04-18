
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StandaloneDepositForm } from "../DepositForm";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";
import { Deposit } from "@/features/deposits/types";

interface NewDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ExtendedClient[];
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: (clientId: string) => Promise<boolean | void>;
}

export const NewDepositDialog: React.FC<NewDepositDialogProps> = ({
  isOpen,
  onOpenChange,
  clients,
  onConfirm,
  refreshClientBalance
}) => {
  // Handle form success
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
        </DialogHeader>
        
        <StandaloneDepositForm
          clients={clients}
          onConfirm={onConfirm}
          refreshClientBalance={refreshClientBalance}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
