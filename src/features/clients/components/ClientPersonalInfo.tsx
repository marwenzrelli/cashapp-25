
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { ClientQRCode } from "./ClientQRCode";
import { RefObject, useState } from "react";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ClientIdBadge } from "./ClientIdBadge";
import { ClientActionButtons } from "./ClientActionButtons";
import { DepositDialog } from "./dialogs/DepositDialog";
import { WithdrawalDialog } from "./dialogs/WithdrawalDialog";
import { useClientOperations } from "../hooks/useClientOperations";

interface ClientPersonalInfoProps {
  client: Client;
  clientId?: number;
  qrCodeRef?: RefObject<HTMLDivElement>;
  formatAmount?: (amount: number) => string;
  refetchClient?: () => void;
  clientBalance?: number | null;
}

export const ClientPersonalInfo = ({
  client,
  clientId,
  qrCodeRef,
  formatAmount = amount => `${amount.toLocaleString()} €`,
  refetchClient,
  clientBalance = null
}: ClientPersonalInfoProps) => {
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  
  console.log("ClientPersonalInfo - clientId:", clientId, "client:", client?.id, "realTimeBalance:", clientBalance);
  
  const { 
    handleDeposit, 
    handleWithdrawal, 
    refreshClientBalance 
  } = useClientOperations(client, clientId, refetchClient);

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <CardTitle className="flex items-center">
            Informations personnelles
            {clientId && <ClientIdBadge clientId={clientId} />}
          </CardTitle>
          
          <ClientActionButtons
            onDepositClick={() => setDepositDialogOpen(true)}
            onWithdrawalClick={() => setWithdrawalDialogOpen(true)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <PersonalInfoFields 
              client={client} 
              formatAmount={formatAmount} 
              showBalance={true} 
              realTimeBalance={clientBalance}
            />
          </div>
          {client && client.id && (
            <div className="flex justify-center md:justify-end" ref={qrCodeRef}>
              <ClientQRCode 
                clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
                clientName={`${client.prenom} ${client.nom}`} 
                size={256} 
              />
            </div>
          )}
        </div>
      </CardContent>
      
      <DepositDialog
        client={client}
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onConfirm={handleDeposit}
        refreshClientBalance={refreshClientBalance}
      />
      
      <WithdrawalDialog
        client={client}
        open={withdrawalDialogOpen}
        onOpenChange={setWithdrawalDialogOpen}
        onConfirm={handleWithdrawal}
        refreshClientBalance={refreshClientBalance}
      />
    </Card>
  );
};
