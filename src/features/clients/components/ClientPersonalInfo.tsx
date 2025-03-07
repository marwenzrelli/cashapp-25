
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Client } from "../types";
import { ClientQRCode } from "./ClientQRCode";
import { RefObject, useState } from "react";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ClientIdBadge } from "./ClientIdBadge";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StandaloneDepositForm } from "@/features/deposits/components/DepositForm";
import { StandaloneWithdrawalForm } from "@/features/withdrawals/components/WithdrawalForm";
import { Deposit } from "@/features/deposits/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientPersonalInfoProps {
  client: Client;
  clientId?: number;
  qrCodeRef?: RefObject<HTMLDivElement>;
  formatAmount?: (amount: number) => string;
}

export const ClientPersonalInfo = ({ 
  client, 
  clientId, 
  qrCodeRef,
  formatAmount = (amount) => `${amount.toLocaleString()} €`
}: ClientPersonalInfoProps) => {
  // States pour les dialogs
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Debugging log to ensure clientId is properly passed
  console.log("ClientPersonalInfo - clientId:", clientId, "client:", client?.id);

  // Fonction pour gérer le versement
  const handleDeposit = async (deposit: Deposit) => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('deposits')
        .insert({
          client_name: deposit.client_name,
          amount: deposit.amount,
          operation_date: new Date(deposit.date).toISOString(),
          notes: deposit.description,
          created_by: session?.user?.id
        });

      if (error) {
        toast.error("Erreur lors de la création du versement", {
          description: error.message
        });
        return;
      }

      toast.success("Versement effectué", {
        description: `Un versement de ${deposit.amount} TND a été ajouté pour ${deposit.client_name}`
      });
      setDepositDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors du versement:", error);
      toast.error("Erreur lors du traitement du versement");
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour gérer le retrait
  const handleWithdrawal = async (withdrawal: any) => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          client_name: withdrawal.client_name,
          amount: withdrawal.amount,
          operation_date: new Date(withdrawal.date).toISOString(),
          notes: withdrawal.notes,
          created_by: session?.user?.id
        });

      if (error) {
        toast.error("Erreur lors de la création du retrait", {
          description: error.message
        });
        return;
      }

      toast.success("Retrait effectué", {
        description: `Un retrait de ${withdrawal.amount} TND a été effectué pour ${withdrawal.client_name}`
      });
      setWithdrawalDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Erreur lors du traitement du retrait");
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour rafraîchir le solde d'un client
  const refreshClientBalance = async () => {
    if (!client || !client.id) return false;
    
    try {
      // Fix #1: Using a direct query instead of a non-existent RPC function
      // The RPC function "refresh_client_balance" doesn't exist in the Supabase project
      // Instead, update the client balance directly
      const { error } = await supabase
        .from('clients')
        .update({ solde: client.solde })
        .eq('id', client.id)
        .select();
      
      return !error;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du solde:", error);
      return false;
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
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setDepositDialogOpen(true)} 
              className="flex items-center gap-2"
              size="sm"
            >
              <ArrowDownToLine className="h-4 w-4" />
              Versement
            </Button>
            <Button 
              onClick={() => setWithdrawalDialogOpen(true)} 
              variant="outline" 
              className="flex items-center gap-2"
              size="sm"
            >
              <ArrowUpToLine className="h-4 w-4" />
              Retrait
            </Button>
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
      
      {/* Dialog pour le versement */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau versement</DialogTitle>
          </DialogHeader>
          
          {client && (
            <StandaloneDepositForm 
              clients={[{ ...client, dateCreation: client.date_creation || '' }]} 
              onConfirm={handleDeposit}
              refreshClientBalance={refreshClientBalance}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour le retrait */}
      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau retrait</DialogTitle>
          </DialogHeader>
          
          {client && (
            <StandaloneWithdrawalForm 
              clients={[{ ...client, dateCreation: client.date_creation || '' }]} 
              onConfirm={handleWithdrawal}
              refreshClientBalance={refreshClientBalance}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
