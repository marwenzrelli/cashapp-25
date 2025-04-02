
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
        </DialogHeader>
        
        <StandaloneDepositForm 
          clients={[{
            ...client,
            dateCreation: client.date_creation || new Date().toISOString()
          }]} 
          onConfirm={onConfirm} 
          refreshClientBalance={refreshClientBalance}
          onSuccess={handleSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
};
