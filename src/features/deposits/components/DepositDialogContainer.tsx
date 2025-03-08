
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

  // Create a wrapper function that handles calling refreshClientBalance with the appropriate clientId
  const handleRefreshClientBalance = () => {
    // If there are clients available, use the first one's ID
    if (clients && clients.length > 0) {
      return refreshClientBalance(clients[0].id.toString());
    }
    // Return a resolved promise with false if no clients are available
    return Promise.resolve(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <StandaloneDepositForm 
        clients={extendedClients}
        onConfirm={onConfirmDeposit}
        refreshClientBalance={handleRefreshClientBalance}
      />
    </Dialog>
  );
};
