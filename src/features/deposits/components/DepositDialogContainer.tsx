
import { Dialog } from "@/components/ui/dialog";
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
      <StandaloneDepositForm
        clients={clients}
        onConfirm={onConfirm}
        refreshClientBalance={refreshClientBalance}
      />
    </Dialog>
  );
};
