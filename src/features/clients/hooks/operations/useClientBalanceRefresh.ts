
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Client } from "../../types";

export function useClientBalanceRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  const refreshClientBalance = async (id: number | string): Promise<boolean> => {
    setIsRefreshing(true);
    try {
      if (!id) {
        console.error("Client ID not provided for balance refresh");
        return false;
      }
      
      // Ensure the ID is a number for database operations
      const clientId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      console.log("Refreshing balance for client ID:", clientId);
      
      // Get client information
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('prenom, nom')
        .eq('id', clientId)
        .single();
      
      if (clientError) {
        console.error("Error retrieving client:", clientError);
        return false;
      }
      
      if (!clientData) {
        console.error("Client not found for ID:", clientId);
        return false;
      }
      
      const clientFullName = `${clientData.prenom} ${clientData.nom}`;
      
      // Get total deposits for this client
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('client_name', clientFullName)
        .eq('status', 'completed');
      
      if (depositsError) {
        console.error("Error retrieving deposits:", depositsError);
        return false;
      }
      
      // Get total withdrawals for this client
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('client_name', clientFullName)
        .eq('status', 'completed');
      
      if (withdrawalsError) {
        console.error("Error retrieving withdrawals:", withdrawalsError);
        return false;
      }
      
      // Fixed: Calculate balance with proper type handling
      const totalDeposits = deposits?.reduce((acc, dep) => {
        // Handle any type of amount value safely
        const amount = typeof dep.amount === 'number' 
          ? dep.amount 
          : dep.amount ? parseFloat(String(dep.amount)) : 0;
        return acc + amount;
      }, 0) || 0;
      
      const totalWithdrawals = withdrawals?.reduce((acc, wd) => {
        // Handle any type of amount value safely
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
        return false;
      }
      
      // Invalidate cached queries to update client information
      invalidateQueries(clientId);
      
      return true;
    } catch (error) {
      console.error("Error refreshing balance:", error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const invalidateQueries = (id: number | string) => {
    queryClient.invalidateQueries({ queryKey: ['operations'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    
    // Convert id to number for consistency
    const clientId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (clientId) {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clientOperations', clientId] });
    }
  };
  
  return {
    isRefreshing,
    refreshClientBalance
  };
}
