
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
      
      // Get transfers received by this client (to_client)
      const { data: transfersReceived, error: transfersReceivedError } = await supabase
        .from('transfers')
        .select('amount')
        .eq('to_client', clientFullName)
        .eq('status', 'completed');
      
      if (transfersReceivedError) {
        console.error("Error retrieving transfers received:", transfersReceivedError);
        return false;
      }
      
      // Get transfers sent by this client (from_client)
      const { data: transfersSent, error: transfersSentError } = await supabase
        .from('transfers')
        .select('amount')
        .eq('from_client', clientFullName)
        .eq('status', 'completed');
      
      if (transfersSentError) {
        console.error("Error retrieving transfers sent:", transfersSentError);
        return false;
      }
      
      // Calculate totals with proper type handling
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
