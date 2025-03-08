
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client } from "@/features/clients/types";
import { StandaloneDepositForm } from "@/features/deposits/components/deposit-form/StandaloneDepositForm";
import { Deposit } from "@/features/deposits/types";

interface DepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onConfirm: (deposit: Deposit) => Promise<void>;
  refreshClientBalance?: () => Promise<boolean>;
}

export const DepositDialog = ({
  isOpen,
  onOpenChange,
  clients,
  onConfirm,
  refreshClientBalance
}: DepositDialogProps) => {
  // Transform Client objects to ExtendedClient objects
  const getExtendedClients = () => {
    return clients.map(client => ({
      ...client,
      dateCreation: client.date_creation || new Date().toISOString()
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
        </DialogHeader>
        
        <StandaloneDepositForm 
          clients={getExtendedClients()} 
          onConfirm={onConfirm} 
          refreshClientBalance={refreshClientBalance} 
        />
      </DialogContent>
    </Dialog>
  );
};
