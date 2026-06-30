
import React from "react";
import { StatsCard } from "./StatsCard";
import { type Withdrawal } from "../types";

interface WithdrawalHeaderProps {
  withdrawals: Withdrawal[];
}

export const WithdrawalHeader: React.FC<WithdrawalHeaderProps> = ({ withdrawals }) => {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Retraits</h1>
      <StatsCard withdrawals={withdrawals} />
    </div>
  );
};
