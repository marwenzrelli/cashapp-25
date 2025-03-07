
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
      toast.error("Fonction de rafraîchissement du solde non disponible");
      return;
    }
    
    setIsRefreshing(true);
    try {
      await refreshClientBalance();
      toast.success("Solde client rafraîchi avec succès");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du solde:", error);
      toast.error("Erreur lors du rafraîchissement du solde");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <CardTitle className="flex items-center">
            Informations personnelles
            {clientId && <ClientIdBadge clientId={clientId} />}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
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
        refreshClientBalance={refreshBalance}
      />
      
      <WithdrawalDialog
        client={client}
        open={withdrawalDialogOpen}
        onOpenChange={setWithdrawalDialogOpen}
        onConfirm={handleWithdrawal}
        refreshClientBalance={refreshBalance}
      />
    </Card>
  );
};
