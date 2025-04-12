import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { ClientQRCode } from "./ClientQRCode";
import { RefObject, useState, useEffect, useRef } from "react";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ClientIdBadge } from "./ClientIdBadge";
import { ClientActionButtons } from "./ClientActionButtons";
import { DepositDialog } from "./dialogs/DepositDialog";
import { WithdrawalDialog } from "./dialogs/WithdrawalDialog";
import { useClientOperations } from "../hooks/useClientOperations";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [refreshDisabled, setRefreshDisabled] = useState(false);
  const refreshCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  
  console.log("ClientPersonalInfo - clientId:", clientId, "client:", client?.id, "realTimeBalance:", clientBalance);

  const {
    handleDeposit,
    handleWithdrawal,
    refreshClientBalance: refreshBalance
  } = useClientOperations(client, clientId, refetchClient);

  useEffect(() => {
    return () => {
      if (refreshCooldownTimerRef.current) {
        clearTimeout(refreshCooldownTimerRef.current);
      }
    };
  }, []);

  const handleRefreshBalance = async () => {
    if (!refreshClientBalance) {
      toast.error("La fonction d'actualisation du solde n'est pas disponible");
      return;
    }
    
    if (isRefreshing || refreshDisabled) {
      return;
    }
    
    setIsRefreshing(true);
    setRefreshDisabled(true);
    
    try {
      await refreshClientBalance();
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      toast.error("Erreur lors de l'actualisation du solde");
    } finally {
      setIsRefreshing(false);
      
      refreshCooldownTimerRef.current = setTimeout(() => {
        setRefreshDisabled(false);
        refreshCooldownTimerRef.current = null;
      }, 5000); // Reduced cooldown to 5 seconds
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

  const dummyExport = () => {
    console.log("Export function not provided");
  };

  // Use real-time balance if available, otherwise fall back to client.solde
  const displayBalance = clientBalance !== null ? clientBalance : client.solde;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 w-full">
          <CardTitle className="flex items-center text-xl">
            Informations personnelles
            {clientId && <ClientIdBadge clientId={clientId} />}
          </CardTitle>
          
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshBalance} 
              disabled={isRefreshing || refreshDisabled}
              className="px-[20px] bg-white/70 dark:bg-gray-800/70 w-full md:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser le solde'}
            </Button>
            
            {!isMobile && (
              <ClientActionButtons 
                onDepositClick={() => setDepositDialogOpen(true)} 
                onWithdrawalClick={() => setWithdrawalDialogOpen(true)}
                exportToExcel={dummyExport}
                exportToPDF={dummyExport}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div className="w-full md:w-3/4">
            <PersonalInfoFields 
              client={client} 
              formatAmount={formatAmount} 
              showBalance={true} 
              realTimeBalance={displayBalance} 
            />
          </div>
          
          {client && client.id && (
            <div className="flex flex-col items-center space-y-4 w-full md:w-1/4">
              <div className="flex justify-center w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-inner" ref={qrCodeRef}>
                <ClientQRCode 
                  clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
                  clientName={`${client.prenom} ${client.nom}`} 
                  size={200} 
                />
              </div>
              
              <div className="md:hidden w-full">
                <ClientActionButtons 
                  onDepositClick={() => setDepositDialogOpen(true)} 
                  onWithdrawalClick={() => setWithdrawalDialogOpen(true)} 
                  orientation="vertical"
                  exportToExcel={dummyExport}
                  exportToPDF={dummyExport}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <DepositDialog client={client} open={depositDialogOpen} onOpenChange={setDepositDialogOpen} onConfirm={handleDeposit} refreshClientBalance={handleDepositRefresh} />
      
      <WithdrawalDialog client={client} open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen} onConfirm={handleWithdrawal} refreshClientBalance={handleWithdrawalRefresh} />
    </Card>
  );
};
