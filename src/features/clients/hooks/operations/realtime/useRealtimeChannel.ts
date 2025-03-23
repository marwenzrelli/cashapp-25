
import { supabase } from "@/integrations/supabase/client";
import { RealtimePayload } from "./types";

/**
 * Create and configure a Supabase realtime channel
 */
export const createRealtimeChannel = (
  handleRealtimeUpdate: (payload: RealtimePayload) => void
) => {
  // Create a single channel for all tables
  return supabase
    .channel('db-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'clients' },
      handleRealtimeUpdate
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'deposits' },
      handleRealtimeUpdate
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'withdrawals' },
      handleRealtimeUpdate
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'transfers' },
      handleRealtimeUpdate
    );
};
