
import { supabase } from "@/integrations/supabase/client";

// Helper function to handle deposit deletion
export const handleDepositDeletion = async (depositId: string | number, userId: string | undefined): Promise<boolean> => {
  console.log(`Attempting to delete deposit with ID: ${depositId}`);
  
  try {
    // Convert string ID to number for database operation if needed
    const numericId = typeof depositId === 'string' ? parseInt(depositId, 10) : depositId;
    
    if (isNaN(numericId)) {
      throw new Error("Invalid deposit ID format");
    }
    
    // 1. First, delete the deposit record
    const { error: deleteError } = await supabase
      .from('deposits')
      .delete()
      .eq('id', numericId);
    
    if (deleteError) {
      console.error("Error deleting deposit:", deleteError);
      throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
    }
    
    // Log to console for tracking
    console.log(`Successfully deleted deposit with ID: ${depositId} by user ${userId || 'unknown'}`);
    
    return true;
  } catch (error) {
    console.error("Complete error during deposit deletion:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Helper function to handle withdrawal deletion
export const handleWithdrawalDeletion = async (withdrawalId: string | number, userId: string | undefined): Promise<boolean> => {
  console.log(`Attempting to delete withdrawal with ID: ${withdrawalId}`);
  
  try {
    // Convert string ID to number for database operation if needed
    const numericId = typeof withdrawalId === 'string' ? parseInt(withdrawalId, 10) : withdrawalId;
    
    if (isNaN(numericId)) {
      throw new Error("Invalid withdrawal ID format");
    }
    
    // 1. First, delete the withdrawal record
    const { error: deleteError } = await supabase
      .from('withdrawals')
      .delete()
      .eq('id', numericId);
    
    if (deleteError) {
      console.error("Error deleting withdrawal:", deleteError);
      throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
    }
    
    // Log to console for tracking
    console.log(`Successfully deleted withdrawal with ID: ${withdrawalId} by user ${userId || 'unknown'}`);
    
    return true;
  } catch (error) {
    console.error("Complete error during withdrawal deletion:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Helper function to handle transfer deletion
export const handleTransferDeletion = async (transferId: string | number, userId: string | undefined): Promise<boolean> => {
  console.log(`Attempting to delete transfer with ID: ${transferId}`);
  
  try {
    // Convert string ID to number for database operation if needed
    const numericId = typeof transferId === 'string' ? parseInt(transferId, 10) : transferId;
    
    if (isNaN(numericId)) {
      throw new Error("Invalid transfer ID format");
    }
    
    // 1. First, delete the transfer record
    const { error: deleteError } = await supabase
      .from('transfers')
      .delete()
      .eq('id', numericId);
    
    if (deleteError) {
      console.error("Error deleting transfer:", deleteError);
      throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
    }
    
    // Log to console for tracking
    console.log(`Successfully deleted transfer with ID: ${transferId} by user ${userId || 'unknown'}`);
    
    return true;
  } catch (error) {
    console.error("Complete error during transfer deletion:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
