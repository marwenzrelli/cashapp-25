
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export interface RecalculateResult {
  updated_count: number;
  details: Array<{
    client: string;
    old_balance: number;
    new_balance: number;
    deposits: number;
    withdrawals: number;
    transfers_in: number;
    transfers_out: number;
    direct_in: number;
    direct_out: number;
  }>;
}

/**
 * Recalcule et met à jour le solde pour tous les clients
 * via la fonction RPC côté serveur (inclut dépôts, retraits, virements, opérations directes)
 */
export const recalculateAllClientBalances = async (): Promise<boolean> => {
  try {
    logger.log("Starting server-side recalculation of all client balances");
    
    const { data, error } = await supabase.rpc('recalculate_all_client_balances');
    
    if (error) {
      console.error("Error recalculating balances:", error);
      return false;
    }
    
    const result = data as unknown as RecalculateResult;
    logger.log(`Recalculation complete: ${result.updated_count} clients updated`);
    
    if (result.details && result.details.length > 0) {
      result.details.forEach(d => {
        logger.log(`${d.client}: ${d.old_balance} → ${d.new_balance}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error recalculating client balances:", error);
    return false;
  }
};
