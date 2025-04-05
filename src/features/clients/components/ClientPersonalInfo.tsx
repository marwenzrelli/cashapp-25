
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
  const [didInitialRefresh, setDidInitialRefresh] = useState(false);
  const [refreshDisabled, setRefreshDisabled] = useState(false);
  const initialRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  console.log("ClientPersonalInfo - clientId:", clientId, "client:", client?.id, "realTimeBalance:", clientBalance);

  const {
    handleDeposit,
    handleWithdrawal,
    refreshClientBalance: refreshBalance
  } = useClientOperations(client, clientId, refetchClient);

  // Automatically refresh balance once when component mounts, with a longer delay
  useEffect(() => {
    if (client && client.id && refreshClientBalance && !didInitialRefresh) {
      const doInitialRefresh = async () => {
        try {
          await refreshClientBalance();
          setDidInitialRefresh(true);
        } catch (error) {
          console.error("Error during initial balance refresh:", error);
        }
      };
      
      // Use a longer timeout (3 seconds) to avoid immediate refresh on page load
      initialRefreshTimerRef.current = setTimeout(doInitialRefresh, 3000);
      return () => {
        if (initialRefreshTimerRef.current) {
          clearTimeout(initialRefreshTimerRef.current);
        }
      };
    }
  }, [client, refreshClientBalance, didInitialRefresh]);

  const handleRefreshBalance = async () => {
    if (!refreshClientBalance) {
      toast.error("La fonction d'actualisation du solde n'est pas disponible");
      return;
    }
    
    // Prevent multiple refreshes
    if (isRefreshing || refreshDisabled) {
      return;
    }
    
    setIsRefreshing(true);
    setRefreshDisabled(true);
    
    try {
      await refreshClientBalance();
      toast.success("Solde du client actualisé avec succès");
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      toast.error("Erreur lors de l'actualisation du solde");
    } finally {
      setIsRefreshing(false);
      
      // Disable the refresh button for 10 seconds to prevent spam
      refreshCooldownTimerRef.current = setTimeout(() => {
        setRefreshDisabled(false);
        refreshCooldownTimerRef.current = null;
      }, 10000); // 10-second cooldown
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (initialRefreshTimerRef.current) {
        clearTimeout(initialRefreshTimerRef.current);
      }
      if (refreshCooldownTimerRef.current) {
        clearTimeout(refreshCooldownTimerRef.current);
      }
    };
  }, []);

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

  // Dummy functions for exportToExcel and exportToPDF
  const dummyExport = () => {
    console.log("Export function not provided");
  };

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <CardTitle className="flex items-center">
            Informations personnelles
            {clientId && <ClientIdBadge clientId={clientId} />}
          </CardTitle>
          
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshBalance} 
              disabled={isRefreshing || refreshDisabled} 
              className="px-[23px]"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser le solde'}
            </Button>
            
            <ClientActionButtons 
              onDepositClick={() => setDepositDialogOpen(true)} 
              onWithdrawalClick={() => setWithdrawalDialogOpen(true)}
              exportToExcel={dummyExport}
              exportToPDF={dummyExport}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <PersonalInfoFields client={client} formatAmount={formatAmount} showBalance={true} realTimeBalance={clientBalance} />
            
            {/* Refresh button for mobile */}
            <div className="md:hidden mt-4 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshBalance} 
                disabled={isRefreshing || refreshDisabled} 
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualisation...' : 'Actualiser le solde'}
              </Button>
            </div>
          </div>
          
          {client && client.id && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="flex justify-center w-full" ref={qrCodeRef}>
                <ClientQRCode 
                  clientId={typeof client.id === 'string' ? parseInt(client.id, 10) : client.id} 
                  clientName={`${client.prenom} ${client.nom}`} 
                  size={256} 
                />
              </div>
              
              {/* Action buttons below QR code on mobile */}
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
