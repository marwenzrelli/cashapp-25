
import { supabase } from "@/integrations/supabase/client";
import { RealtimeState } from "./types";

/**
 * Hook to handle cleanup of realtime subscription resources
 */
export const useRealtimeCleanup = (
  state: RealtimeState,
  throttleTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  const cleanup = () => {
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = null;
    }
    
    if (state.channel) {
      console.log("Cleaning up realtime subscription");
      try {
        supabase.removeChannel(state.channel);
      } catch (err) {
        console.error("Error removing channel:", err);
      }
    }
  };

  return {
    cleanup
  };
};
