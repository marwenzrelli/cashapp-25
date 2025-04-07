
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useOperationsRealtime = (refreshOperations: (force: boolean) => void) => {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;

  const setupRealtimeSubscription = useCallback(() => {
    if (!isMountedRef.current) return;
    
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

      // Subscribe to changes
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'deposits'
          },
          (payload) => {
            if (!isMountedRef.current) return;
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
            if (!isMountedRef.current) return;
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
            if (!isMountedRef.current) return;
            console.log('Realtime event received for transfers:', payload.eventType);
            refreshOperations(true);
          }
        )
        .subscribe((status) => {
          if (!isMountedRef.current) return;
          
          console.log(`Realtime subscription status: ${status}`);
          isSubscribedRef.current = status === 'SUBSCRIBED';
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to realtime updates for operations');
            setReconnectAttempts(0); // Reset attempts on success
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to realtime updates');
            
            // Attempt to reconnect if mounted and under max attempts
            if (isMountedRef.current && reconnectAttempts < maxReconnectAttempts) {
              if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
              }
              
              const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
              console.log(`Will attempt to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1})`);
              
              reconnectTimerRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                  setReconnectAttempts(prev => prev + 1);
                  setupRealtimeSubscription();
                }
              }, delay);
            } else if (reconnectAttempts >= maxReconnectAttempts) {
              // Only show toast if we've exceeded max attempts
              toast.error('Erreur de connexion temps réel');
            }
          }
        });

    } catch (error) {
      if (!isMountedRef.current) return;
      
      console.error('Error setting up realtime subscription:', error);
      toast.error('Erreur de connexion temps réel');
    }
  }, [refreshOperations, reconnectAttempts]);

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
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // Make sure component is mounted/unmounted correctly
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      cleanupRealtime();
    };
  }, [cleanupRealtime]);

  // Set up realtime subscription when component mounts
  useEffect(() => {
    if (!isMountedRef.current) return;
    
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
