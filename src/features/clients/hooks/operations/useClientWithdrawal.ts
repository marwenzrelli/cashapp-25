
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ensureValidISODate } from "@/features/withdrawals/hooks/utils/formatUtils";

export function useClientWithdrawal(clientId?: number, refetchClient?: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  
  const handleWithdrawal = async (withdrawal: any, isEditing: boolean = false, withdrawalId?: number | string) => {
    setIsProcessing(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      
      // Create a proper date object from the input
      let operationDate: string;
      
      if (withdrawal.date) {
        // Ensure we're using a proper ISO string for the date
        operationDate = ensureValidISODate(withdrawal.date);
        
        console.log("Using withdrawal date:", {
          input: withdrawal.date,
          processed: operationDate
        });
      } else {
        operationDate = new Date().toISOString();
        console.log("No date provided, using current date");
      }
      
      // Parse amount to ensure it's a number
      const amount = parseFloat(withdrawal.amount);
      if (isNaN(amount)) {
        console.error("Invalid amount:", withdrawal.amount);
        toast.error("Montant invalide");
        setIsProcessing(false);
        return false;
      }
      
      if (isEditing && withdrawalId) {
        // Convert ID to number if it's a string
        const numericId = typeof withdrawalId === 'string' ? parseInt(withdrawalId, 10) : withdrawalId;
        
        // Update existing withdrawal
        const {
          data: updatedWithdrawal,
          error
        } = await supabase.from('withdrawals').update({
          client_name: withdrawal.client_name,
          client_id: clientId, // Set client_id explicitly
          amount: amount,
          operation_date: operationDate,
          notes: withdrawal.notes,
          last_modified_at: new Date().toISOString()
        }).eq('id', numericId).select();
        
        if (error) {
          console.error("Error updating withdrawal:", error);
          toast.error("Error updating withdrawal", {
            description: error.message
          });
          return false;
        }
        
        toast.success("Withdrawal updated", {
          description: `The withdrawal of ${withdrawal.amount} TND for ${withdrawal.client_name} has been updated`
        });
      } else {
        // Insert new withdrawal
        const {
          data: insertedWithdrawal,
          error
        } = await supabase.from('withdrawals').insert({
          client_name: withdrawal.client_name,
          client_id: clientId, // Set client_id explicitly
          amount: amount,
          operation_date: operationDate,
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
      }
      
      // Invalidate cached queries to update operation lists
      invalidateQueries(clientId);
      
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
    handleWithdrawal
  };
}
