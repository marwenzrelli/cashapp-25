
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
  
  return (
    <Card className="md:col-span-3 overflow-hidden border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <CardTitle className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-700 dark:from-primary dark:to-blue-500">
            Informations personnelles
            {clientId && <ClientIdBadge clientId={clientId} />}
          </CardTitle>
          
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshBalance} 
              disabled={isRefreshing}
              className={cn(
                "transition-all h-10 backdrop-blur-sm bg-white/80 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800 shadow-sm",
                isRefreshing && "opacity-70"
              )}
            >
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
      
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center md:items-start">
            <PersonalInfoFields 
              client={client} 
              formatAmount={formatAmount} 
              showBalance={true} 
              realTimeBalance={clientBalance} 
            />
            
            <div className="md:hidden mt-6 w-full space-y-3 max-w-md mx-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshBalance} 
                disabled={isRefreshing} 
                className="w-full h-10 backdrop-blur-sm bg-white/80 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualisation...' : 'Actualiser le solde'}
              </Button>
              
              <ClientActionButtons 
                onDepositClick={() => setDepositDialogOpen(true)} 
                onWithdrawalClick={() => setWithdrawalDialogOpen(true)} 
                orientation="vertical" 
              />
              
              {/* Bouton QR Code ici, en dessous des boutons de versement et retrait */}
              {client && client.id && (
                <div className="w-full mt-2">
                  <ClientQRCode 
                    clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
                    clientName={`${client.prenom} ${client.nom}`} 
                    size={256} 
                  />
                </div>
              )}
            </div>
          </div>
          
          {client && client.id && (
            <div className="hidden md:flex flex-col items-center justify-center space-y-4 w-full">
              <div className="flex justify-center w-full p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-inner" ref={qrCodeRef}>
                <ClientQRCode 
                  clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
                  clientName={`${client.prenom} ${client.nom}`} 
                  size={256} 
                />
              </div>
            </div>
          )}
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
