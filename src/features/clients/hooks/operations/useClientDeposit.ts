
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";
import { useQueryClient } from "@tanstack/react-query";
import { handleDepositDeletion } from "@/features/operations/utils/deletionUtils";

export function useClientDeposit(clientId?: number, refetchClient?: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  
  const handleDeposit = async (deposit: Deposit & { isEditing?: boolean; depositId?: string | number }) => {
    setIsProcessing(true);
    console.log("Handling deposit with data:", deposit);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      
      // Check if we're editing an existing deposit
      if (deposit.isEditing && deposit.depositId) {
        const numericId = typeof deposit.depositId === 'string' ? parseInt(deposit.depositId, 10) : deposit.depositId;
        
        // Update existing deposit
        const {
          data: updatedDeposit,
          error
        } = await supabase.from('deposits').update({
          client_name: deposit.client_name,
          amount: deposit.amount,
          operation_date: new Date(deposit.date).toISOString(),
          notes: deposit.description,
          last_modified_at: new Date().toISOString()
        }).eq('id', numericId).select();
        
        if (error) {
          console.error("Error updating deposit:", error);
          toast.error("Error updating deposit", {
            description: error.message
          });
          return false;
        }
        
        console.log("Deposit updated successfully:", updatedDeposit);
        toast.success("Deposit updated", {
          description: `The deposit of ${deposit.amount} TND for ${deposit.client_name} has been updated`
        });
      } else {
        // Insert new deposit
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
        
        console.log("Deposit created successfully:", insertedDeposit);
        toast.success("Deposit completed", {
          description: `A deposit of ${deposit.amount} TND has been added for ${deposit.client_name}`
        });
      }
      
      // Invalidate cached queries to update operation lists
      invalidateQueries(clientId);
      
      // Call update function if available
      if (refetchClient) {
        console.log("Calling refetchClient after deposit operation");
        await refetchClient();
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
  
  const deleteDeposit = async (depositId: string | number) => {
    setIsProcessing(true);
    try {
      console.log("Starting deleteDeposit with ID:", depositId);
      
      // Get the user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        console.warn("User not authenticated");
        // Continue anyway for testing purposes
      }
      
      // Use the centralized function for deletion
      const success = await handleDepositDeletion(depositId, userId);
      
      if (!success) {
        toast.error("Deletion failed", { description: "Error during deposit deletion" });
        return false;
      }
      
      toast.success("Deposit deleted successfully");
      console.log("Deposit successfully deleted, ID:", depositId);
      
      // Invalidate cached queries to update operation lists
      invalidateQueries(clientId);
      
      // Call update function if available
      if (refetchClient) {
        console.log("Calling refetchClient after deposit deletion");
        await refetchClient();
      }
      
      return true;
    } catch (error) {
      console.error("Error during deposit deletion:", error);
      toast.error("Error deleting deposit", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const invalidateQueries = (id?: number) => {
    console.log("Invalidating queries after deposit operation");
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
    handleDeposit,
    deleteDeposit
  };
}
