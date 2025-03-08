
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client } from "../../types";
import { StandaloneDepositForm } from "@/features/deposits/components/DepositForm";
import { Deposit } from "@/features/deposits/types";

interface DepositDialogProps {
  client: Client;
  isOpen: boolean; // Changed from 'open' to 'isOpen' to match the interface
  onOpenChange: (open: boolean) => void;
  onConfirm: (deposit: Deposit) => Promise<boolean | void>; // Updated return type
  refreshClientBalance: () => Promise<boolean>;
}

export const DepositDialog = ({
  client,
  isOpen, // Changed from 'open' to 'isOpen'
  onOpenChange,
  onConfirm,
  refreshClientBalance
}: DepositDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}> {/* Changed from 'open={open}' to 'open={isOpen}' */}
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
        />
      </DialogContent>
    </Dialog>
  );
};
