
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWebNotifications } from './useWebNotifications';
import { toast } from 'sonner';

export const useTransactionNotifications = () => {
  const { showNotification, permission } = useWebNotifications();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    // Only set up notifications if permission is granted and not already subscribed
    if (permission !== 'granted' || isSubscribedRef.current) {
      return;
    }

    console.log('Setting up transaction notifications...');
    isSubscribedRef.current = true;

    // Create a single channel for all transaction types
    const channel = supabase
      .channel('transaction-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deposits'
      }, (payload) => {
        const deposit = payload.new;
        showNotification('Nouveau versement', {
          body: `Versement de ${deposit.amount} TND pour ${deposit.client_name}`,
          tag: 'deposit'
        });
        
        toast.success('Nouveau versement détecté', {
          description: `${deposit.amount} TND pour ${deposit.client_name}`
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'withdrawals'
      }, (payload) => {
        const withdrawal = payload.new;
        showNotification('Nouveau retrait', {
          body: `Retrait de ${withdrawal.amount} TND pour ${withdrawal.client_name}`,
          tag: 'withdrawal'
        });
        
        toast.info('Nouveau retrait détecté', {
          description: `${withdrawal.amount} TND pour ${withdrawal.client_name}`
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transfers'
      }, (payload) => {
        const transfer = payload.new;
        showNotification('Nouveau virement', {
          body: `Virement de ${transfer.amount} TND de ${transfer.from_client} vers ${transfer.to_client}`,
          tag: 'transfer'
        });
        
        toast.info('Nouveau virement détecté', {
          description: `${transfer.amount} TND de ${transfer.from_client} vers ${transfer.to_client}`
        });
      })
      .subscribe((status) => {
        console.log('Transaction notifications subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Transaction notifications actives');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erreur de subscription aux notifications');
          isSubscribedRef.current = false;
        }
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log('Cleaning up transaction notifications...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      isSubscribedRef.current = false;
    };
  }, [permission, showNotification]);

  return {
    isActive: permission === 'granted' && isSubscribedRef.current
  };
};
