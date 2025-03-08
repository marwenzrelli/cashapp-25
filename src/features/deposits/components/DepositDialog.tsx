
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client } from "@/features/clients/types";
import { StandaloneDepositForm } from "@/features/deposits/components/deposit-form/StandaloneDepositForm";
import { Deposit } from "@/features/deposits/types";

interface DepositDialogProps {
  client: Client;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: () => Promise<boolean>;
}

export const DepositDialog = ({
  client,
  isOpen,
  onOpenChange,
  onConfirm,
  refreshClientBalance
}: DepositDialogProps) => {
  // Create a function to transform Client to ExtendedClient
  const getExtendedClient = () => {
    return {
      ...client,
      dateCreation: client.date_creation || new Date().toISOString()
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
        </DialogHeader>
        
        <StandaloneDepositForm 
          clients={[getExtendedClient()]} 
          onConfirm={onConfirm} 
          refreshClientBalance={() => refreshClientBalance()} 
        />
      </DialogContent>
    </Dialog>
  );
};
