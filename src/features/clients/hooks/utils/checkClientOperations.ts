
import { supabase } from "@/integrations/supabase/client";

// This utility function checks different operation tables to see if any operations
// exist for a given client name or ID
export const checkClientOperations = async (clientName: string, clientId: number, token?: string) => {
  console.log(`Checking operations for client: "${clientName}" (ID: ${clientId})${token ? ' with token' : ''}`);
  
  try {
    // Set auth token if provided (for public client access)
    if (token) {
      supabase.auth.setAuth(token);
    }
    
    // Check deposits
    const { count: depositCount, error: depositError } = await supabase
      .from('deposits')
      .select('*', { count: 'exact', head: true })
      .ilike('client_name', `%${clientName}%`);
      
    if (depositError) console.error("Error checking deposits:", depositError);
    
    // Check withdrawals
    const { count: withdrawalCount, error: withdrawalError } = await supabase
      .from('withdrawals')
      .select('*', { count: 'exact', head: true })
      .ilike('client_name', `%${clientName}%`);
      
    if (withdrawalError) console.error("Error checking withdrawals:", withdrawalError);
    
    // Check transfers as sender
    const { count: transferSenderCount, error: transferSenderError } = await supabase
      .from('transfers')
      .select('*', { count: 'exact', head: true })
      .ilike('from_client', `%${clientName}%`);
      
    if (transferSenderError) console.error("Error checking transfers (sender):", transferSenderError);
    
    // Check transfers as receiver
    const { count: transferReceiverCount, error: transferReceiverError } = await supabase
      .from('transfers')
      .select('*', { count: 'exact', head: true })
      .ilike('to_client', `%${clientName}%`);
      
    if (transferReceiverError) console.error("Error checking transfers (receiver):", transferReceiverError);
    
    // Reset auth if token was provided
    if (token) {
      supabase.auth.setAuth(null);
    }
    
    const results = {
      depositCount: depositCount || 0,
      withdrawalCount: withdrawalCount || 0,
      transferSenderCount: transferSenderCount || 0, 
      transferReceiverCount: transferReceiverCount || 0,
      totalCount: (depositCount || 0) + (withdrawalCount || 0) + (transferSenderCount || 0) + (transferReceiverCount || 0)
    };
    
    console.log(`Operations check for client "${clientName}" (ID: ${clientId}):`, results);
    
    return results;
  } catch (error) {
    console.error("Error checking client operations:", error);
    return {
      depositCount: 0,
      withdrawalCount: 0,
      transferSenderCount: 0,
      transferReceiverCount: 0,
      totalCount: 0,
      error
    };
  }
};
