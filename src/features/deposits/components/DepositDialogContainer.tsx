
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Deposit } from "@/features/deposits/types";
import { StandaloneDepositForm } from "./DepositForm";
import { Client } from "@/features/clients/types";

interface DepositDialogContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onConfirm: (deposit: Deposit) => Promise<void>;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
}

export const DepositDialogContainer = ({
  open,
  onOpenChange,
  clients,
  onConfirm,
  refreshClientBalance,
}: DepositDialogContainerProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
        </DialogHeader>
        <StandaloneDepositForm
          clients={clients}
          onConfirm={async (deposit) => {
            await onConfirm(deposit);
            onOpenChange(false);
          }}
          refreshClientBalance={refreshClientBalance}
        />
      </DialogContent>
    </Dialog>
  );
};
