
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Deposit } from "@/features/deposits/types";
import { useQueryClient } from "@tanstack/react-query";

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
  
  const deleteDeposit = async (depositId: string | number) => {
    setIsProcessing(true);
    try {
      // Get the user session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        console.error("User not authenticated");
        toast.error("You must be logged in to delete a deposit");
        return false;
      }
      
      // Convert ID to number if it's a string
      const numericId = typeof depositId === 'string' ? parseInt(depositId, 10) : depositId;
      
      console.log(`Starting deletion of deposit with ID: ${numericId}`);
      
      // First, get the deposit to log it before deletion
      const { data: depositData, error: fetchError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', numericId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching deposit:", fetchError);
        toast.error("Deletion failed", { description: "Unable to retrieve deposit information" });
        return false;
      }
      
      if (!depositData) {
        console.error("No deposit found with ID:", numericId);
        toast.error("Deposit not found", { description: "The deposit you're trying to delete couldn't be found" });
        return false;
      }
      
      console.log("Preparing to log in deleted_deposits:", depositData);
      
      // Log the deposit in deleted_deposits
      const { data: logData, error: logError } = await supabase
        .from('deleted_deposits')
        .insert({
          original_id: depositData.id,
          client_name: depositData.client_name,
          amount: Number(depositData.amount),
          operation_date: depositData.operation_date || depositData.created_at,
          notes: depositData.notes || null,
          deleted_by: userId,
          status: depositData.status
        })
        .select();
      
      if (logError) {
        console.error("Error logging to deleted_deposits:", logError);
        toast.error("Deletion failed", { description: "Error during logging" });
        return false;
      }
      
      console.log("Successfully logged in deleted_deposits:", logData);
      
      // Verify the log was created
      if (!logData || logData.length === 0) {
        console.error("Failed to verify log creation in deleted_deposits");
        toast.error("Deletion failed", { description: "Could not verify deletion log creation" });
        return false;
      }
      
      // Delete the deposit
      const { error: deleteError } = await supabase
        .from('deposits')
        .delete()
        .eq('id', numericId);
      
      if (deleteError) {
        console.error("Error deleting deposit:", deleteError);
        toast.error("Deletion failed", { description: "Error during deletion" });
        return false;
      }
      
      console.log("Deposit successfully deleted");
      
      // Invalidate cached queries to update operation lists
      invalidateQueries(clientId);
      
      // Call update function if available
      if (refetchClient) {
        refetchClient();
      }
      
      return true;
    } catch (error) {
      console.error("Error during deposit deletion:", error);
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
    handleDeposit,
    deleteDeposit
  };
}
