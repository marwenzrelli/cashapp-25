
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useOperationsRealtime = (refreshOperations: (force: boolean) => void) => {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef<boolean>(false);

  const setupRealtimeSubscription = useCallback(() => {
    console.log('Setting up realtime subscription for operations...');
    try {
      // Cleanup any existing channel before creating a new one
      if (channelRef.current) {
        console.log('Cleaning up existing channel before creating a new one');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Create a new channel for listening to database changes
      const channelName = `operations-changes-${Date.now()}`;
      console.log(`Creating new channel: ${channelName}`);
      const channel = supabase.channel(channelName);
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
          (payload) => {
            console.log('Realtime event received for deposits:', payload.eventType);
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
          (payload) => {
            console.log('Realtime event received for withdrawals:', payload.eventType);
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
          (payload) => {
            console.log('Realtime event received for transfers:', payload.eventType);
            refreshOperations(true);
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
          isSubscribedRef.current = status === 'SUBSCRIBED';
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to realtime updates for operations');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to realtime updates');
            toast.error('Erreur de connexion temps réel');
          }
        });

    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      toast.error('Erreur de connexion temps réel');
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
    console.log('useOperationsRealtime effect running');
    setupRealtimeSubscription();
    
    // Clean up subscription when component unmounts
    return () => {
      cleanupRealtime();
    };
  }, [setupRealtimeSubscription, cleanupRealtime]);

  return {
    cleanupRealtime,
    setupRealtimeSubscription,
    isSubscribed: isSubscribedRef.current
  };
};
