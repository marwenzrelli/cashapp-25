
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRealTimeBalance = (clientId: number | null) => {
  const [realTimeBalance, setRealTimeBalance] = useState<number | null>(null);
  const previousBalanceRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);
  const connectionAttemptRef = useRef(0);
  
  // Set up a real-time subscription for client balance
  useEffect(() => {
    if (!clientId) return;
    
    // Limit connection attempts
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
      
    return () => {
      console.log("Cleaning up real-time subscription for balance");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [clientId]);

  return { realTimeBalance, setRealTimeBalance };
};
