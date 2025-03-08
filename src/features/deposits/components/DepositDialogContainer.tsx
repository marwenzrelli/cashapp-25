
import { Dialog } from "@/components/ui/dialog";
import { Deposit } from "@/features/deposits/types";
import { StandaloneDepositForm } from "@/features/deposits/components/deposit-form/StandaloneDepositForm";
import { Client } from "@/features/clients/types";
import { ExtendedClient } from "@/features/withdrawals/components/standalone/StandaloneWithdrawalForm";

interface DepositDialogContainerProps {
  isOpen: boolean; 
  clients: Client[];
  onConfirmDeposit: (deposit: Deposit) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
}

export const DepositDialogContainer = ({
  isOpen,
  clients,
  onConfirmDeposit,
  onOpenChange,
  refreshClientBalance
}: DepositDialogContainerProps) => {
  // Convert Client[] to ExtendedClient[] for the deposit form
  const extendedClients: ExtendedClient[] = clients.map(client => ({
    ...client,
    dateCreation: client.date_creation || new Date().toISOString()
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <StandaloneDepositForm 
        clients={extendedClients}
        onConfirm={onConfirmDeposit}
        refreshClientBalance={refreshClientBalance}
      />
    </Dialog>
  );
};
