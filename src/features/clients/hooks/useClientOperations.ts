
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
      const {
        error
      } = await supabase.from('deposits').insert({
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
      
      // Invalidate cached operations data to refresh the operations list
      invalidateQueries();
      
      // Call the refetch function if available
      if (refetchClient) {
        refetchClient();
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors du versement:", error);
      toast.error("Erreur lors du traitement du versement");
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
      const {
        error
      } = await supabase.from('withdrawals').insert({
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
        return false;
      }
      toast.success("Retrait effectué", {
        description: `Un retrait de ${withdrawal.amount} TND a été effectué pour ${withdrawal.client_name}`
      });
      
      // Invalidate cached operations data to refresh the operations list
      invalidateQueries();
      
      // Call the refetch function if available
      if (refetchClient) {
        refetchClient();
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Erreur lors du traitement du retrait");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const refreshClientBalance = async () => {
    if (!client || !client.id) return false;
    try {
      const {
        error
      } = await supabase.from('clients').update({
        solde: client.solde
      }).eq('id', client.id).select();
      
      // Invalidate cached client data to refresh the client's balance
      invalidateQueries();
      
      return !error;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du solde:", error);
      return false;
    }
  };
  
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['operations'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
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
