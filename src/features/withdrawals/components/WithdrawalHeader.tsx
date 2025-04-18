
import React from "react";
import { StatsCard } from "./StatsCard";
import { type Withdrawal } from "../types";

interface WithdrawalHeaderProps {
  withdrawals: Withdrawal[];
  filteredDeposits?: Withdrawal[];
  isLoading?: boolean;
}

export const WithdrawalHeader: React.FC<WithdrawalHeaderProps> = ({ 
  withdrawals,
  filteredDeposits,
  isLoading = false
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Retraits</h1>
        <p className="text-muted-foreground">
          Gérez les retraits des clients
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1">
        <StatsCard withdrawals={withdrawals} />
      </div>
    </div>
  );
};
