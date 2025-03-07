
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Recalcule et met à jour le solde pour tous les clients
 * en se basant sur la somme de leurs dépôts et retraits
 */
export const recalculateAllClientBalances = async (): Promise<boolean> => {
  try {
    console.log("Starting recalculation of all client balances");
    
    // Récupérer tous les clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, prenom, nom');
      
    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      return false;
    }
    
    if (!clients || clients.length === 0) {
      console.log("No clients found");
      return true;
    }
    
    console.log(`Found ${clients.length} clients to update`);
    
    // Traiter les clients par lots
    const batchSize = 5;
    let successCount = 0;
    
    for (let i = 0; i < clients.length; i += batchSize) {
      const batch = clients.slice(i, i + batchSize);
      
      // Traiter chaque client du lot
      await Promise.all(batch.map(async (client) => {
        const clientFullName = `${client.prenom} ${client.nom}`;
        
        // Récupérer tous les dépôts du client
        const { data: deposits, error: depositsError } = await supabase
          .from('deposits')
          .select('amount')
          .eq('client_name', clientFullName)
          .eq('status', 'completed');
          
        if (depositsError) {
          console.error(`Error fetching deposits for client ${clientFullName}:`, depositsError);
          return;
        }
        
        // Récupérer tous les retraits du client
        const { data: withdrawals, error: withdrawalsError } = await supabase
          .from('withdrawals')
          .select('amount')
          .eq('client_name', clientFullName)
          .eq('status', 'completed');
          
        if (withdrawalsError) {
          console.error(`Error fetching withdrawals for client ${clientFullName}:`, withdrawalsError);
          return;
        }
        
        // Fixed: Proper type checking and safer conversion
        const totalDeposits = deposits?.reduce((sum, d) => {
          // Safely convert to number using String() first to avoid 'never' type issues
          const amount = typeof d.amount === 'number' 
            ? d.amount 
            : d.amount ? parseFloat(String(d.amount)) : 0;
          return sum + amount;
        }, 0) || 0;
        
        const totalWithdrawals = withdrawals?.reduce((sum, w) => {
          // Safely convert to number using String() first to avoid 'never' type issues
          const amount = typeof w.amount === 'number' 
            ? w.amount 
            : w.amount ? parseFloat(String(w.amount)) : 0;
          return sum + amount;
        }, 0) || 0;
        
        const balance = totalDeposits - totalWithdrawals;
        
        // Log le calcul pour debugging
        console.log(`${clientFullName}: Deposits=${totalDeposits}, Withdrawals=${totalWithdrawals}, Balance=${balance}`);
        
        // Mettre à jour le solde du client
        const { error: updateError } = await supabase
          .from('clients')
          .update({ solde: balance })
          .eq('id', client.id);
          
        if (updateError) {
          console.error(`Error updating balance for client ${clientFullName}:`, updateError);
          return;
        }
        
        console.log(`Updated balance for ${clientFullName}: ${balance}`);
        successCount++;
      }));
      
      // Pause entre les lots pour éviter de surcharger l'API
      if (i + batchSize < clients.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`Successfully updated ${successCount}/${clients.length} client balances`);
    return true;
  } catch (error) {
    console.error("Error recalculating client balances:", error);
    return false;
  }
};
