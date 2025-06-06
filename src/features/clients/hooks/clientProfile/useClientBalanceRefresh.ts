
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/features/clients/types";

export const useClientBalanceRefresh = (
  clientId: number | null, 
  client: Client | null,
  setRealTimeBalance: (balance: number) => void,
  refetchClient: () => void
) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshClientBalance = useCallback(async () => {
    if (!clientId || !client) return;
    
    try {
      setIsRefreshing(true);
      console.log("Manual balance refresh for client:", clientId);
      
      const clientFullName = `${client.prenom} ${client.nom}`;
      
      // Get all client deposits
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('client_name', clientFullName)
        .eq('status', 'completed');
      
      if (depositsError) {
        console.error("Error retrieving deposits:", depositsError);
        toast.error("Erreur lors de la récupération des dépôts");
        return;
      }
      
      // Get all client withdrawals
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('client_name', clientFullName)
        .eq('status', 'completed');
      
      if (withdrawalsError) {
        console.error("Error retrieving withdrawals:", withdrawalsError);
        toast.error("Erreur lors de la récupération des retraits");
        return;
      }
      
      // Get transfers received by this client (to_client)
      const { data: transfersReceived, error: transfersReceivedError } = await supabase
        .from('transfers')
        .select('amount')
        .eq('to_client', clientFullName)
        .eq('status', 'completed');
      
      if (transfersReceivedError) {
        console.error("Error retrieving transfers received:", transfersReceivedError);
        toast.error("Erreur lors de la récupération des virements reçus");
        return;
      }
      
      // Get transfers sent by this client (from_client)
      const { data: transfersSent, error: transfersSentError } = await supabase
        .from('transfers')
        .select('amount')
        .eq('from_client', clientFullName)
        .eq('status', 'completed');
      
      if (transfersSentError) {
        console.error("Error retrieving transfers sent:", transfersSentError);
        toast.error("Erreur lors de la récupération des virements émis");
        return;
      }
      
      // Calculate totals with proper type checking
      const totalDeposits = deposits?.reduce((acc, dep) => {
        const amount = typeof dep.amount === 'number' 
          ? dep.amount 
          : dep.amount ? parseFloat(String(dep.amount)) : 0;
        return acc + amount;
      }, 0) || 0;
      
      const totalWithdrawals = withdrawals?.reduce((acc, wd) => {
        const amount = typeof wd.amount === 'number' 
          ? wd.amount 
          : wd.amount ? parseFloat(String(wd.amount)) : 0;
        return acc + amount;
      }, 0) || 0;
      
      const totalTransfersReceived = transfersReceived?.reduce((acc, tr) => {
        const amount = typeof tr.amount === 'number' 
          ? tr.amount 
          : tr.amount ? parseFloat(String(tr.amount)) : 0;
        return acc + amount;
      }, 0) || 0;
      
      const totalTransfersSent = transfersSent?.reduce((acc, tr) => {
        const amount = typeof tr.amount === 'number' 
          ? tr.amount 
          : tr.amount ? parseFloat(String(tr.amount)) : 0;
        return acc + amount;
      }, 0) || 0;
      
      // New balance calculation: deposits + transfers received - withdrawals - transfers sent
      const balance = parseFloat((totalDeposits + totalTransfersReceived - totalWithdrawals - totalTransfersSent).toFixed(2));
      
      console.log(`Balance calculated for ${clientFullName}: 
        Deposits: ${totalDeposits}, 
        Withdrawals: ${totalWithdrawals}, 
        Transfers Received: ${totalTransfersReceived},
        Transfers Sent: ${totalTransfersSent},
        Final balance: ${balance}`);
      
      // Update balance in database
      const { error: updateError } = await supabase
        .from('clients')
        .update({ solde: balance })
        .eq('id', clientId);
      
      if (updateError) {
        console.error("Error updating balance:", updateError);
        toast.error("Erreur lors de la mise à jour du solde");
        return;
      }
      
      // Update real-time balance locally
      setRealTimeBalance(balance);
      
      toast.success("Solde client mis à jour avec succès");
      
      // Refresh client data
      refetchClient();
      
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast.error("Erreur lors de l'actualisation du solde");
    } finally {
      setIsRefreshing(false);
    }
  }, [clientId, client, setRealTimeBalance, refetchClient]);

  return { refreshClientBalance, isRefreshing };
};
