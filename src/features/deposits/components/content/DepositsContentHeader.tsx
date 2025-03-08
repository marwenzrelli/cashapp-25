
import { DepositsHeader } from "@/features/deposits/components/DepositsHeader";
import { Deposit } from "@/features/deposits/types"; // Use consistent type
import { ExtendedClient } from "@/features/withdrawals/components/standalone/StandaloneWithdrawalForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DepositDialog } from "@/features/deposits/components/DepositDialog";
import { Client } from "@/features/clients/types";

interface DepositsContentHeaderProps {
  deposits: Deposit[];
  filteredDeposits: Deposit[];
  isLoading: boolean;
  clients: ExtendedClient[];
  handleCreateDeposit: (deposit: Deposit) => Promise<void>;
  handleRefreshClientBalance: () => Promise<boolean>;
  fetchClients: () => Promise<void>;
}

export const DepositsContentHeader = ({
  deposits,
  filteredDeposits,
  isLoading,
  clients,
  handleCreateDeposit,
  handleRefreshClientBalance,
  fetchClients
}: DepositsContentHeaderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
        <DepositsHeader 
          deposits={deposits} 
          filteredDeposits={filteredDeposits}
          isLoading={isLoading}
        />
        
        <Button 
          className="w-full sm:w-auto" 
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau versement
        </Button>
      </div>
      
      <DepositDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        clients={clients as Client[]} 
        onConfirm={handleCreateDeposit}
        refreshClientBalance={handleRefreshClientBalance}
      />
    </div>
  );
};
