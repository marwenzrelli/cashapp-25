
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRealTimeBalance = (clientId: number | null) => {
  const [realTimeBalance, setRealTimeBalance] = useState<number | null>(null);
  
  // Set up a real-time subscription for client balance
  useEffect(() => {
    if (!clientId) return;
    
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
          console.log("Real-time balance update received:", payload.new.solde);
          setRealTimeBalance(Number(payload.new.solde));
        }
      })
      .subscribe((status) => {
        console.log(`Real-time subscription status for client ${clientId}:`, status);
      });
      
    return () => {
      console.log("Cleaning up real-time subscription for balance");
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return { realTimeBalance, setRealTimeBalance };
};
