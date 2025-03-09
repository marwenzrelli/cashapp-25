
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
          <CardTitle className="flex items-center">
            Informations personnelles
            {clientId && <ClientIdBadge clientId={clientId} />}
          </CardTitle>
          
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshBalance} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser le solde'}
            </Button>
            
            <div className="flex items-center gap-2">
              {client && client.id && (
                <ClientQRCode 
                  clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
                  clientName={`${client.prenom} ${client.nom}`} 
                  size={230}
                  buttonOnly={true}
                />
              )}
              <ClientActionButtons onDepositClick={() => setDepositDialogOpen(true)} onWithdrawalClick={() => setWithdrawalDialogOpen(true)} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            {/* Personal Information with improved spacing */}
            <PersonalInfoFields 
              client={client} 
              formatAmount={formatAmount} 
              showBalance={true} 
              realTimeBalance={clientBalance}
            />
            
            {/* Mobile buttons section with improved spacing */}
            <div className="md:hidden space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshBalance} 
                disabled={isRefreshing} 
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualisation...' : 'Actualiser le solde'}
              </Button>
              
              <div className="flex items-center gap-2 w-full">
                {client && client.id && (
                  <ClientQRCode 
                    clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
                    clientName={`${client.prenom} ${client.nom}`} 
                    size={230}
                    buttonOnly={true}
                  />
                )}
                <ClientActionButtons 
                  onDepositClick={() => setDepositDialogOpen(true)} 
                  onWithdrawalClick={() => setWithdrawalDialogOpen(true)} 
                />
              </div>
            </div>
          </div>
          
          {/* Right column with QR code on desktop */}
          <div className="flex flex-col items-center space-y-4">
            {client && client.id && (
              <div className="hidden md:block w-full max-w-[280px]" ref={qrCodeRef}>
                <ClientQRCode 
                  clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
                  clientName={`${client.prenom} ${client.nom}`} 
                  size={230}
                  buttonOnly={false}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <DepositDialog 
        client={client} 
        open={depositDialogOpen} 
        onOpenChange={setDepositDialogOpen} 
        onConfirm={handleDeposit} 
        refreshClientBalance={handleDepositRefresh} 
      />
      
      <WithdrawalDialog 
        client={client} 
        open={withdrawalDialogOpen} 
        onOpenChange={setWithdrawalDialogOpen} 
        onConfirm={handleWithdrawal} 
        refreshClientBalance={handleWithdrawalRefresh} 
      />
    </Card>;
};
