
import React from 'react';
import { StandaloneWithdrawalForm } from "../standalone/StandaloneWithdrawalForm";
import { ExtendedClient } from "../../hooks/form/withdrawalFormTypes";

interface WithdrawalFormSectionProps {
  clients: ExtendedClient[];
  onConfirm: (withdrawal: any) => Promise<void>;
  refreshClientBalance: (clientId: string) => Promise<boolean>;
}

export const WithdrawalFormSection: React.FC<WithdrawalFormSectionProps> = ({
  clients,
  onConfirm,
  refreshClientBalance
}) => {
  return (
    <div className="w-full">
      <StandaloneWithdrawalForm 
        clients={clients} 
        onConfirm={onConfirm} 
        refreshClientBalance={refreshClientBalance} 
      />
    </div>
  );
};
