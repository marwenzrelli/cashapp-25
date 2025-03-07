
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/features/clients/types";

export const useClientBalanceRefresh = (
  clientId: number | null, 
  client: Client | null,
  setRealTimeBalance: (balance: number) => void,
  refetchClient: () => void
) => {
  const refreshClientBalance = useCallback(async () => {
    if (!clientId || !client) return;
    
    try {
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
      
      // CORRECTION: Calculer le solde avec une meilleure conversion numérique
      const totalDeposits = deposits?.reduce((acc, dep) => {
        const amount = typeof dep.amount === 'number' 
          ? dep.amount 
          : parseFloat(dep.amount.toString());
        return acc + amount;
      }, 0) || 0;
      
      const totalWithdrawals = withdrawals?.reduce((acc, wd) => {
        const amount = typeof wd.amount === 'number' 
          ? wd.amount 
          : parseFloat(wd.amount.toString());
        return acc + amount;
      }, 0) || 0;
      
      const balance = totalDeposits - totalWithdrawals;
      
      console.log(`Balance calculated for ${clientFullName}: 
        Deposits: ${totalDeposits}, 
        Withdrawals: ${totalWithdrawals}, 
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
    }
  }, [clientId, client, setRealTimeBalance, refetchClient]);

  return { refreshClientBalance };
};
