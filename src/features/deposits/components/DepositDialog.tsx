
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client } from "@/features/clients/types";
import { StandaloneDepositForm } from "@/features/deposits/components/deposit-form/StandaloneDepositForm";
import { Deposit } from "@/features/deposits/types";

interface DepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: () => Promise<boolean>;
}

export const DepositDialog = ({
  isOpen,
  onOpenChange,
  clients,
  onConfirm,
  refreshClientBalance
}: DepositDialogProps) => {
  // Create a function to transform Client to ExtendedClient
  const getExtendedClient = () => {
    return {
      ...clients[0],
      dateCreation: clients[0].date_creation || new Date().toISOString()
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
        </DialogHeader>
        
        <StandaloneDepositForm 
          clients={clients.map(client => ({
            ...client,
            dateCreation: client.date_creation || new Date().toISOString()
          }))} 
          onConfirm={onConfirm} 
          refreshClientBalance={refreshClientBalance} 
        />
      </DialogContent>
    </Dialog>
  );
};
