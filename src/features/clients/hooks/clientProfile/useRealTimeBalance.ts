
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRealTimeBalance = (clientId: number | null) => {
  const [realTimeBalance, setRealTimeBalance] = useState<number | null>(null);
  const previousBalanceRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);
  const operationsChannelRef = useRef<any>(null);
  const connectionAttemptRef = useRef(0);

  // Function to refresh operations when we detect changes
  const refreshOperations = useCallback(() => {
    // We'll dispatch a custom event that other components can listen to
    window.dispatchEvent(new CustomEvent('operations-update', {
      detail: { clientId }
    }));
  }, [clientId]);
  
  // Set up a real-time subscription for client balance
  useEffect(() => {
    if (!clientId) return;
    
    // Limit connection attempts to prevent excessive connections
    if (connectionAttemptRef.current >= 2) {
      console.log("Max connection attempts reached for balance updates");
      return;
    }
    
    connectionAttemptRef.current++;
    console.log("Setting up real-time subscription for client balance ID:", clientId);
    
    const channel = supabase
      .channel(`client-balance-${clientId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${clientId}`
      }, (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'solde' in payload.new) {
          const newBalance = Number(payload.new.solde);
          
          // Only update state if the balance has actually changed
          if (previousBalanceRef.current !== newBalance) {
            console.log("Real-time balance update received:", newBalance);
            setRealTimeBalance(newBalance);
            previousBalanceRef.current = newBalance;
          }
        }
      })
      .subscribe((status) => {
        console.log(`Real-time subscription status for client ${clientId}:`, status);
        if (status === 'CHANNEL_ERROR') {
          console.error("Error subscribing to balance updates");
        }
      });
      
    channelRef.current = channel;

    // Set up a subscription for operations affecting this client
    const operationsChannel = supabase
      .channel(`client-operations-${clientId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deposits'
      }, (payload) => {
        console.log("Deposit operation detected:", payload);
        toast.info("Un nouveau versement a été détecté");
        refreshOperations();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawals'
      }, (payload) => {
        console.log("Withdrawal operation detected:", payload);
        toast.info("Un nouveau retrait a été détecté");
        refreshOperations();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transfers'
      }, (payload) => {
        console.log("Transfer operation detected:", payload);
        toast.info("Un nouveau transfert a été détecté");
        refreshOperations();
      })
      .subscribe();

    operationsChannelRef.current = operationsChannel;
      
    return () => {
      console.log("Cleaning up real-time subscriptions");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (operationsChannelRef.current) {
        supabase.removeChannel(operationsChannelRef.current);
        operationsChannelRef.current = null;
      }
    };
  }, [clientId, refreshOperations]);

  return { realTimeBalance, setRealTimeBalance };
};
