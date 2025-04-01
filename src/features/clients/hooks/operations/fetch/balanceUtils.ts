
import { Client } from "../../../types";
import { supabase } from "@/integrations/supabase/client";
import { BATCH_SIZE, BATCH_DELAY } from "./constants";

/**
 * Updates client balances by fetching deposits and withdrawals
 */
export const updateClientBalances = async (
  clientsList: Client[],
  updateClientState: (updatedClient: Client) => void
) => {
  if (!supabase || !clientsList.length) return;
  
  try {
    // Prioritize recent clients for balance updates
    const sortedClients = [...clientsList].sort((a, b) => {
      const dateA = new Date(a.date_creation || 0).getTime();
      const dateB = new Date(b.date_creation || 0).getTime();
      return dateB - dateA;
    });
    
    // Process clients in batches, prioritizing recently created clients
    for (let i = 0; i < sortedClients.length; i += BATCH_SIZE) {
      const batch = sortedClients.slice(i, i + BATCH_SIZE);
      
      // Use Promise.all to process the batch in parallel
      await Promise.all(batch.map(async (client) => {
        try {
          const clientName = `${client.prenom} ${client.nom}`;
          
          // Fetch deposits and withdrawals in parallel
          const [depositsResult, withdrawalsResult] = await Promise.all([
            supabase.from('deposits').select('amount').eq('client_name', clientName),
            supabase.from('withdrawals').select('amount').eq('client_name', clientName)
          ]);
          
          const deposits = depositsResult.data || [];
          const withdrawals = withdrawalsResult.data || [];
          
          const depositsTotal = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
          const withdrawalsTotal = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
          const balance = depositsTotal - withdrawalsTotal;

          // Only update if balance has changed
          if (client.solde !== balance) {
            // Update database
            const { error: updateError } = await supabase
              .from('clients')
              .update({ solde: balance || 0 })
              .eq('id', client.id);

            if (updateError) {
              console.warn(`Impossible de mettre à jour le solde pour ${clientName}:`, updateError);
              return;
            }

            // Update local state via callback
            updateClientState({
              ...client,
              solde: balance || 0
            });
          }
        } catch (error) {
          console.error(`Erreur pour le client ${client.id}:`, error);
        }
      }));
      
      // Pause between batches
      if (i + BATCH_SIZE < sortedClients.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des soldes:", error);
  }
};
