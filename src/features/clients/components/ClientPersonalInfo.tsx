
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
import { cn } from "@/lib/utils";

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

  // Helper function to pass client ID to refreshBalance
  const handleDepositRefresh = async (): Promise<boolean> => {
    if (client && client.id) {
      return await refreshBalance(client.id);
    }
    return false;
  };

  // Helper function to pass client ID to refreshBalance
  const handleWithdrawalRefresh = async (): Promise<boolean> => {
    if (client && client.id) {
      return await refreshBalance(client.id);
    }
    return false;
  };
  
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <CardTitle className="flex items-center">
            Informations personnelles
            {clientId && <ClientIdBadge clientId={clientId} />}
          </CardTitle>
          
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshBalance} disabled={isRefreshing}
              className={cn("transition-all", isRefreshing && "opacity-70")}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser le solde'}
            </Button>
            
            <ClientActionButtons 
              onDepositClick={() => setDepositDialogOpen(true)} 
              onWithdrawalClick={() => setWithdrawalDialogOpen(true)} 
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Personal info with centered layout */}
          <div className="w-full max-w-md mx-auto mb-6">
            <PersonalInfoFields 
              client={client} 
              formatAmount={formatAmount} 
              showBalance={true} 
              realTimeBalance={clientBalance}
              showBalanceOnMobile={true}
              className="text-center md:text-left"
            />
          </div>
          
          {/* QR code and buttons section */}
          <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-4">
            {/* Refresh button for mobile - centered */}
            <div className="md:hidden w-full">
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
            </div>
            
            {/* Action buttons for mobile */}
            <div className="md:hidden w-full">
              <ClientActionButtons 
                onDepositClick={() => setDepositDialogOpen(true)} 
                onWithdrawalClick={() => setWithdrawalDialogOpen(true)} 
                orientation="horizontal" 
                className="mb-4"
              />
            </div>
            
            {/* QR Code centered for both mobile and desktop */}
            {client && client.id && (
              <div className="flex justify-center w-full" ref={qrCodeRef}>
                <ClientQRCode 
                  clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
                  clientName={`${client.prenom} ${client.nom}`} 
                  size={220} 
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
    </Card>
  );
};
