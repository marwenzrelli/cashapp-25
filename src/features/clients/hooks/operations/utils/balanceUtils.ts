
import { Client } from "../../../types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates client balances by calculating deposits minus withdrawals
 * Optimized to process clients in batches for better performance
 */
export const updateClientBalances = async (
  clientsList: Client[], 
  setClients: React.Dispatch<React.SetStateAction<Client[]>>
) => {
  if (!supabase || !clientsList.length) return;
  
  try {
    // Process only 10 most recent clients for immediate balance updates
    const recentClients = [...clientsList]
      .sort((a, b) => new Date(b.date_creation || '').getTime() - new Date(a.date_creation || '').getTime())
      .slice(0, 10);
    
    // Process all clients at once
    await Promise.all(recentClients.map(async (client) => {
      try {
        const clientName = `${client.prenom} ${client.nom}`;
        
        // Fetch deposits and withdrawals in parallel with timeout
        const fetchPromise = Promise.all([
          supabase.from('deposits').select('amount').eq('client_name', clientName),
          supabase.from('withdrawals').select('amount').eq('client_name', clientName)
        ]);
        
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 3000)
        );
        
        const [depositsResult, withdrawalsResult] = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]) as any;
        
        const deposits = depositsResult.data || [];
        const withdrawals = withdrawalsResult.data || [];
        
        const depositsTotal = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
        const withdrawalsTotal = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
        const balance = depositsTotal - withdrawalsTotal;

        // Only update if balance has changed
        if (client.solde !== balance) {
          // Update database silently - don't throw on error
          supabase
            .from('clients')
            .update({ solde: balance || 0 })
            .eq('id', client.id)
            .then(({ error }) => {
              if (error) {
                console.warn(`Could not update balance for ${clientName}:`, error);
              }
            });

          // Update local state immediately
          setClients(prevClients => 
            prevClients.map(c => 
              c.id === client.id ? { ...c, solde: balance || 0 } : c
            )
          );
        }
      } catch (error) {
        // Catch errors for individual clients without stopping the process
        console.warn(`Error for client ${client.id}:`, error);
      }
    }));
    
    // Schedule updates for remaining clients
    if (clientsList.length > 10) {
      setTimeout(() => {
        const remainingClients = [...clientsList]
          .sort((a, b) => new Date(b.date_creation || '').getTime() - new Date(a.date_creation || '').getTime())
          .slice(10);
        updateClientBalances(remainingClients, setClients);
      }, 100);
    }
  } catch (error) {
    console.warn("Error updating balances:", error);
  }
};
