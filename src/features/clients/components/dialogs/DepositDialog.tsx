
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client } from "../../types";
import { StandaloneDepositForm } from "@/features/deposits/components/DepositForm";
import { Deposit } from "@/features/deposits/types";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";

interface DepositDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deposit: Deposit) => Promise<boolean | void>; 
  refreshClientBalance: () => Promise<boolean | void>; 
}

export const DepositDialog = ({
  client,
  open,
  onOpenChange,
  onConfirm,
  refreshClientBalance
}: DepositDialogProps) => {
  // Close dialog on success
  const handleSuccess = () => {
    onOpenChange(false);
  };

  // Create an extended client with additional properties needed for the deposit form
  const extendedClient: ExtendedClient = {
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  };

  // Prepare a function to refresh a specific client's balance
  const handleRefreshBalance = async (clientId: string) => {
    return refreshClientBalance();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
        </DialogHeader>
        
        <StandaloneDepositForm 
          clients={[extendedClient]} 
          onConfirm={onConfirm} 
          refreshClientBalance={handleRefreshBalance}
          onSuccess={handleSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
};
