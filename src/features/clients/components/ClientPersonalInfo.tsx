
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
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ClientPersonalInfoProps {
  client: Client;
  clientId?: number;
  qrCodeRef?: RefObject<HTMLDivElement>;
  formatAmount?: (amount: number) => string;
  refetchClient?: () => void;
  refreshClientBalance?: () => Promise<void>;
  clientBalance?: number | null;
}

export const ClientPersonalInfo = ({
  client,
  clientId,
  qrCodeRef,
  formatAmount = amount => `${amount.toLocaleString()} €`,
  refetchClient,
  refreshClientBalance,
  clientBalance = null
}: ClientPersonalInfoProps) => {
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log("ClientPersonalInfo - clientId:", clientId, "client:", client?.id, "realTimeBalance:", clientBalance);

  const {
    handleDeposit,
    handleWithdrawal,
    refreshClientBalance: refreshBalance
  } = useClientOperations(client, clientId, refetchClient);

  const handleRefreshBalance = async () => {
    if (!refreshClientBalance) {
      toast.error("Balance refresh function not available");
      return;
    }
    setIsRefreshing(true);
    try {
      await refreshClientBalance();
      toast.success("Client balance refreshed successfully");
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      toast.error("Error refreshing client balance");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDepositRefresh = async (): Promise<boolean> => {
    if (client && client.id) {
      return await refreshBalance(client.id);
    }
    return false;
  };

  const handleWithdrawalRefresh = async (): Promise<boolean> => {
    if (client && client.id) {
      return await refreshBalance(client.id);
    }
    return false;
  };

  return <Card className="md:col-span-3">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center">
              Informations personnelles
            </CardTitle>
            
            <div className="flex items-center gap-4">
              {clientId && <ClientIdBadge clientId={clientId} />}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshBalance} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser le solde'}
            </Button>
            
            <div className="hidden md:flex">
              <ClientActionButtons onDepositClick={() => setDepositDialogOpen(true)} onWithdrawalClick={() => setWithdrawalDialogOpen(true)} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <PersonalInfoFields client={client} formatAmount={formatAmount} showBalance={true} realTimeBalance={clientBalance} />
            
            <div className="md:hidden mt-4 w-full">
              <Button variant="outline" size="sm" onClick={handleRefreshBalance} disabled={isRefreshing} className="w-full">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualisation...' : 'Actualiser le solde'}
              </Button>
            </div>
            
            <div className="md:hidden w-full mt-4">
              <ClientActionButtons onDepositClick={() => setDepositDialogOpen(true)} onWithdrawalClick={() => setWithdrawalDialogOpen(true)} orientation="vertical" />
            </div>
            
            {/* QR Code component - now moved below the action buttons on mobile */}
            {client && client.id && <div className="md:hidden mt-4 w-full" ref={qrCodeRef}>
              <ClientQRCode clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} clientName={`${client.prenom} ${client.nom}`} size={230} />
            </div>}
          </div>
          
          <div className="flex-col items-center space-y-4 w-full hidden md:flex">
            {/* First show action buttons on desktop */}
            <div className="w-full">
              <ClientActionButtons 
                onDepositClick={() => setDepositDialogOpen(true)} 
                onWithdrawalClick={() => setWithdrawalDialogOpen(true)} 
                orientation="vertical" 
              />
            </div>
            
            {/* Then show QR code below the action buttons on desktop */}
            {client && client.id && 
              <div className="w-full" ref={qrCodeRef}>
                <ClientQRCode 
                  clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
                  clientName={`${client.prenom} ${client.nom}`} 
                  size={180} 
                />
              </div>
            }
          </div>
        </div>
      </CardContent>
      
      <DepositDialog client={client} open={depositDialogOpen} onOpenChange={setDepositDialogOpen} onConfirm={handleDeposit} refreshClientBalance={handleDepositRefresh} />
      
      <WithdrawalDialog client={client} open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen} onConfirm={handleWithdrawal} refreshClientBalance={handleWithdrawalRefresh} />
    </Card>;
};
