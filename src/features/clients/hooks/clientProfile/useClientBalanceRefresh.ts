
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
      
      // Fixed: Proper type checking before conversion to avoid 'never' type issues
      const totalDeposits = deposits?.reduce((acc, dep) => {
        // Safely convert amount to number regardless of its original type
        const amount = typeof dep.amount === 'number' 
          ? dep.amount 
          : dep.amount ? parseFloat(String(dep.amount)) : 0;
        return acc + amount;
      }, 0) || 0;
      
      const totalWithdrawals = withdrawals?.reduce((acc, wd) => {
        // Safely convert amount to number regardless of its original type
        const amount = typeof wd.amount === 'number' 
          ? wd.amount 
          : wd.amount ? parseFloat(String(wd.amount)) : 0;
        return acc + amount;
      }, 0) || 0;
      
      // Fix floating point precision issues by rounding to 2 decimal places
      const balance = parseFloat((totalDeposits - totalWithdrawals).toFixed(2));
      
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
    } finally {
      setIsRefreshing(false);
    }
  }, [clientId, client, setRealTimeBalance, refetchClient]);

  return { refreshClientBalance, isRefreshing };
};
