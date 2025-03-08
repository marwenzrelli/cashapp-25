
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper function to handle deposit deletion and logging
export const handleDepositDeletion = async (depositId: string, userId: string | undefined): Promise<boolean> => {
  console.log(`Attempting to delete deposit with ID: ${depositId}`);
  
  try {
    // 1. First, delete the deposit record
    const { error: deleteError } = await supabase
      .from('deposits')
      .delete()
      .eq('id', depositId);
    
    if (deleteError) {
      console.error("Error deleting deposit:", deleteError);
      throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
    }
    
    // 2. Log the deletion in the operations_log table
    const { error: logError } = await supabase
      .from('operations_log')
      .insert({
        operation_type: 'deposit_deletion',
        entity_id: depositId,
        performed_by: userId,
        details: JSON.stringify({ deposit_id: depositId, deleted_at: new Date().toISOString() })
      });
    
    if (logError) {
      console.error("Error logging deposit deletion:", logError);
      // We continue even if logging fails - the main operation succeeded
    }
    
    console.log(`Successfully deleted deposit with ID: ${depositId}`);
    return true;
  } catch (error) {
    console.error("Complete error during deposit deletion:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Helper function to handle withdrawal deletion and logging
export const handleWithdrawalDeletion = async (withdrawalId: string, userId: string | undefined): Promise<boolean> => {
  console.log(`Attempting to delete withdrawal with ID: ${withdrawalId}`);
  
  try {
    // 1. First, delete the withdrawal record
    const { error: deleteError } = await supabase
      .from('withdrawals')
      .delete()
      .eq('id', withdrawalId);
    
    if (deleteError) {
      console.error("Error deleting withdrawal:", deleteError);
      throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
    }
    
    // 2. Log the deletion in the operations_log table
    const { error: logError } = await supabase
      .from('operations_log')
      .insert({
        operation_type: 'withdrawal_deletion',
        entity_id: withdrawalId,
        performed_by: userId,
        details: JSON.stringify({ withdrawal_id: withdrawalId, deleted_at: new Date().toISOString() })
      });
    
    if (logError) {
      console.error("Error logging withdrawal deletion:", logError);
      // We continue even if logging fails - the main operation succeeded
    }
    
    console.log(`Successfully deleted withdrawal with ID: ${withdrawalId}`);
    return true;
  } catch (error) {
    console.error("Complete error during withdrawal deletion:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Helper function to handle transfer deletion and logging
export const handleTransferDeletion = async (transferId: string, userId: string | undefined): Promise<boolean> => {
  console.log(`Attempting to delete transfer with ID: ${transferId}`);
  
  try {
    // 1. First, delete the transfer record
    const { error: deleteError } = await supabase
      .from('transfers')
      .delete()
      .eq('id', transferId);
    
    if (deleteError) {
      console.error("Error deleting transfer:", deleteError);
      throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
    }
    
    // 2. Log the deletion in the operations_log table
    const { error: logError } = await supabase
      .from('operations_log')
      .insert({
        operation_type: 'transfer_deletion',
        entity_id: transferId,
        performed_by: userId,
        details: JSON.stringify({ transfer_id: transferId, deleted_at: new Date().toISOString() })
      });
    
    if (logError) {
      console.error("Error logging transfer deletion:", logError);
      // We continue even if logging fails - the main operation succeeded
    }
    
    console.log(`Successfully deleted transfer with ID: ${transferId}`);
    return true;
  } catch (error) {
    console.error("Complete error during transfer deletion:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
