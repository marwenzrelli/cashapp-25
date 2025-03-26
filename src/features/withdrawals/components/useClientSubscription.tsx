
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseClientSubscriptionProps {
  fetchClients: () => void;
  immediateUpdate?: boolean;
}

export const useClientSubscription = ({ 
  fetchClients,
  immediateUpdate = true
}: UseClientSubscriptionProps) => {
  const channelRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFetch = useCallback(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set a new timer to fetch clients after a short delay
    debounceTimerRef.current = setTimeout(() => {
      console.log('Executing debounced fetch after database operation');
      fetchClients();
      debounceTimerRef.current = null;
    }, 300); // 300ms debounce time
  }, [fetchClients]);

  useEffect(() => {
    // Clean up previous subscription if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    // Create a new channel for all relevant tables
    const channel = supabase
      .channel('public:operations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          console.log('Client update detected');
          debouncedFetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposits'
        },
        () => {
          console.log('Deposit operation detected');
          debouncedFetch();
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
          console.log('Withdrawal operation detected');
          debouncedFetch();
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
          console.log('Transfer operation detected');
          debouncedFetch();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED' && immediateUpdate) {
          // Fetch initial data when subscription is established
          fetchClients();
        }
      });

    channelRef.current = channel;

    return () => {
      // Clean up on unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchClients, debouncedFetch, immediateUpdate]);
};
