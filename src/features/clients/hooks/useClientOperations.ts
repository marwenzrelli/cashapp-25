
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Deposit } from "@/features/deposits/types";
import { Client } from "../types";

export function useClientOperations(client: Client, clientId?: number, refetchClient?: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  
  const handleDeposit = async (deposit: Deposit) => {
    setIsProcessing(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      
      // Insert deposit into database
      const {
        data: insertedDeposit,
        error
      } = await supabase.from('deposits').insert({
        client_name: deposit.client_name,
        amount: deposit.amount,
        operation_date: new Date(deposit.date).toISOString(),
        notes: deposit.description,
        created_by: session?.user?.id
      }).select();
      
      if (error) {
        console.error("Error creating deposit:", error);
        toast.error("Error creating deposit", {
          description: error.message
        });
        return false;
      }
      
      toast.success("Deposit completed", {
        description: `A deposit of ${deposit.amount} TND has been added for ${deposit.client_name}`
      });
      
      // Manually refresh client balance
      const clientIdToRefresh = client?.id || clientId;
      if (clientIdToRefresh) {
        await refreshClientBalance(clientIdToRefresh);
      }
      
      // Invalidate cached queries to update operation lists
      invalidateQueries();
      
      // Call update function if available
      if (refetchClient) {
        refetchClient();
      }
      
      return true;
    } catch (error) {
      console.error("Error during deposit:", error);
      toast.error("Error processing deposit");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWithdrawal = async (withdrawal: any) => {
    setIsProcessing(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      
      // Insert withdrawal into database
      const {
        data: insertedWithdrawal,
        error
      } = await supabase.from('withdrawals').insert({
        client_name: withdrawal.client_name,
        amount: withdrawal.amount,
        operation_date: new Date(withdrawal.date).toISOString(),
        notes: withdrawal.notes,
        created_by: session?.user?.id
      }).select();
      
      if (error) {
        console.error("Error creating withdrawal:", error);
        toast.error("Error creating withdrawal", {
          description: error.message
        });
        return false;
      }
      
      toast.success("Withdrawal completed", {
        description: `A withdrawal of ${withdrawal.amount} TND has been made for ${withdrawal.client_name}`
      });
      
      // Manually refresh client balance
      const clientIdToRefresh = client?.id || clientId;
      if (clientIdToRefresh) {
        await refreshClientBalance(clientIdToRefresh);
      }
      
      // Invalidate cached queries to update operation lists
      invalidateQueries();
      
      // Call update function if available
      if (refetchClient) {
        refetchClient();
      }
      
      return true;
    } catch (error) {
      console.error("Error during withdrawal:", error);
      toast.error("Error processing withdrawal");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const refreshClientBalance = async (id: number | string): Promise<boolean> => {
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
      
      // Calculate balance manually - FIXED: using proper number conversion
      const totalDeposits = deposits?.reduce((acc, dep) => acc + parseFloat(dep.amount.toString()), 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((acc, wd) => acc + parseFloat(wd.amount.toString()), 0) || 0;
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
        return false;
      }
      
      // Invalidate cached queries to update client information
      invalidateQueries();
      
      return true;
    } catch (error) {
      console.error("Error refreshing balance:", error);
      return false;
    }
  };
  
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['operations'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    if (clientId) {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clientOperations', clientId] });
    }
  };
  
  return {
    isProcessing,
    handleDeposit,
    handleWithdrawal,
    refreshClientBalance
  };
}
