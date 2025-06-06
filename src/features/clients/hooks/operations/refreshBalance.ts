
import { Client } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRefreshClientBalance = (
  setClients: React.Dispatch<React.SetStateAction<Client[]>>
) => {
  // Function to refresh a client's balance
  const refreshClientBalance = async (id: number | string): Promise<boolean> => {
    try {
      // Ensure the ID is a number
      const clientId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      console.log("Refreshing balance for client ID:", clientId);
      
      // Check Supabase connection
      if (!supabase) {
        throw new Error("Database connection is not available");
      }
      
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
      console.log("Client full name:", clientFullName);
      
      // Get total deposits for this client
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount')
        .eq('client_name', clientFullName);
      
      if (depositsError) {
        console.error("Error retrieving deposits:", depositsError);
        return false;
      }
      
      // Get total withdrawals for this client
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('client_name', clientFullName);
      
      if (withdrawalsError) {
        console.error("Error retrieving withdrawals:", withdrawalsError);
        return false;
      }
      
      // Get transfers received by this client (to_client)
      const { data: transfersReceived, error: transfersReceivedError } = await supabase
        .from('transfers')
        .select('amount')
        .eq('to_client', clientFullName);
      
      if (transfersReceivedError) {
        console.error("Error retrieving transfers received:", transfersReceivedError);
        return false;
      }
      
      // Get transfers sent by this client (from_client)
      const { data: transfersSent, error: transfersSentError } = await supabase
        .from('transfers')
        .select('amount')
        .eq('from_client', clientFullName);
      
      if (transfersSentError) {
        console.error("Error retrieving transfers sent:", transfersSentError);
        return false;
      }
      
      // Calculate balance manually with new formula
      const totalDeposits = deposits?.reduce((acc, dep) => acc + Number(dep.amount), 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((acc, wd) => acc + Number(wd.amount), 0) || 0;
      const totalTransfersReceived = transfersReceived?.reduce((acc, tr) => acc + Number(tr.amount), 0) || 0;
      const totalTransfersSent = transfersSent?.reduce((acc, tr) => acc + Number(tr.amount), 0) || 0;
      
      // New balance calculation: deposits + transfers received - withdrawals - transfers sent
      const balance = totalDeposits + totalTransfersReceived - totalWithdrawals - totalTransfersSent;
      
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
        toast.error("Error updating balance", {
          description: updateError.message
        });
        return false;
      }
      
      // Update client in local state
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === clientId ? { ...client, solde: balance } : client
        )
      );
      
      console.log(`Client ${clientFullName} balance successfully updated: ${balance}`);
      return true;
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast.error("Error refreshing balance", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    }
  };

  return { refreshClientBalance };
};
