
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useOperationsRealtime = (refreshOperations: (force: boolean) => void) => {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef<boolean>(false);

  const setupRealtimeSubscription = useCallback(() => {
    try {
      // Cleanup any existing channel before creating a new one
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Create a new channel for listening to database changes
      const channel = supabase.channel('operations-changes');
      channelRef.current = channel;

      // Subscribe to deposits changes
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'deposits'
          },
          () => {
            console.log('Realtime event received for deposits');
            refreshOperations(true);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'withdrawals'
          },
          () => {
            console.log('Realtime event received for withdrawals');
            refreshOperations(true);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transfers'
          },
          () => {
            console.log('Realtime event received for transfers');
            refreshOperations(true);
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
          isSubscribedRef.current = status === 'SUBSCRIBED';
        });

    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }
  }, [refreshOperations]);

  const cleanupRealtime = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up realtime subscription');
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
      channelRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  // Set up realtime subscription when component mounts
  useEffect(() => {
    setupRealtimeSubscription();
    
    // Clean up subscription when component unmounts
    return () => {
      cleanupRealtime();
    };
  }, [setupRealtimeSubscription, cleanupRealtime]);

  return {
    cleanupRealtime,
    isSubscribed: isSubscribedRef.current
  };
};
