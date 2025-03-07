
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client } from "../../types";
import { StandaloneWithdrawalForm } from "@/features/withdrawals/components/standalone/StandaloneWithdrawalForm";

interface WithdrawalDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (withdrawal: any) => Promise<boolean | void>;
  refreshClientBalance: () => Promise<boolean>;
}

export const WithdrawalDialog = ({
  client,
  open,
  onOpenChange,
  onConfirm,
  refreshClientBalance
}: WithdrawalDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau retrait</DialogTitle>
        </DialogHeader>
        
        <StandaloneWithdrawalForm 
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
