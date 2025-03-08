
import { DepositsHeader } from "../DepositsHeader";
import { Deposit } from "@/components/deposits/types";
import { StandaloneDepositForm } from "../deposit-form/StandaloneDepositForm";
import { ExtendedClient } from "@/features/withdrawals/components/standalone/StandaloneWithdrawalForm";
import { useEffect } from "react";

interface DepositsContentHeaderProps {
  deposits: Deposit[];
  filteredDeposits: Deposit[];
  isLoading?: boolean;
  clients: ExtendedClient[];
  handleCreateDeposit: (deposit: any) => Promise<void>;
  handleRefreshClientBalance: (clientId: string) => Promise<boolean>;
  fetchClients: () => Promise<void>;
}

export const DepositsContentHeader = ({
  deposits,
  filteredDeposits,
  isLoading = false,
  clients,
  handleCreateDeposit,
  handleRefreshClientBalance,
  fetchClients
}: DepositsContentHeaderProps) => {
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <>
      <DepositsHeader 
        deposits={deposits}
        filteredDeposits={filteredDeposits}
        isLoading={isLoading}
      />
      
      <div>
        <StandaloneDepositForm
          clients={clients}
          onConfirm={handleCreateDeposit}
          refreshClientBalance={handleRefreshClientBalance}
        />
      </div>
    </>
  );
};
