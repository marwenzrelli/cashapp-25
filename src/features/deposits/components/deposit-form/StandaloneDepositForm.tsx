
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtendedClient } from "@/features/withdrawals/components/standalone/StandaloneWithdrawalForm";
import { Deposit } from "@/features/deposits/types";
import { DepositFormContent } from "./DepositFormContent";

interface StandaloneDepositFormProps {
  clients: ExtendedClient[];
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: () => Promise<boolean>;
}

export const StandaloneDepositForm = ({
  clients,
  onConfirm,
  refreshClientBalance
}: StandaloneDepositFormProps) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-blue-700">Nouveau versement</CardTitle>
        <CardDescription>
          Créez un nouveau versement pour un client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DepositFormContent
          clients={clients}
          onConfirm={onConfirm}
          refreshClientBalance={refreshClientBalance}
        />
      </CardContent>
    </Card>
  );
};
