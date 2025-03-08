
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";
import { useQueryClient } from "@tanstack/react-query";

export function useClientDeposit(clientId?: number, refetchClient?: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  
  const handleDeposit = async (deposit: Deposit): Promise<boolean | void> => {
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
      
      // Invalidate cached queries to update operation lists
      invalidateQueries(clientId);
      
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
  
  const invalidateQueries = (id?: number) => {
    queryClient.invalidateQueries({ queryKey: ['operations'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['clientOperations', id] });
    }
  };
  
  return {
    isProcessing,
    handleDeposit
  };
}
