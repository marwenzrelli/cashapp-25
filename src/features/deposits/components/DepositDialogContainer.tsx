
import { Dialog } from "@/components/ui/dialog";
import { Deposit } from "@/features/deposits/types";
import { StandaloneDepositForm } from "./DepositForm";
import { Client } from "@/features/clients/types";
import { ExtendedClient } from "@/features/withdrawals/hooks/form/withdrawalFormTypes";

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
  // Convert regular clients to ExtendedClients
  const extendedClients: ExtendedClient[] = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <StandaloneDepositForm
        clients={extendedClients}
        onConfirm={onConfirm}
        refreshClientBalance={refreshClientBalance}
      />
    </Dialog>
  );
};
