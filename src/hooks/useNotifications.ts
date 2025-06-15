
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNotifications = () => {
  const notificationPermission = useRef<NotificationPermission>('default');
  const channelRef = useRef<any>(null);

  // Demander la permission pour les notifications
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      notificationPermission.current = permission;
      
      if (permission === 'granted') {
        toast.success('Notifications activées avec succès !');
      } else if (permission === 'denied') {
        toast.error('Permission de notification refusée. Vous pouvez la réactiver dans les paramètres de votre navigateur.');
      }
      
      return permission;
    }
    return 'denied';
  }, []);

  // Afficher une notification dans le navigateur
  const showBrowserNotification = useCallback((title: string, body: string, icon?: string) => {
    if ('Notification' in window && notificationPermission.current === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'transaction-notification',
        requireInteraction: false,
      });

      // Auto-fermer après 5 secondes
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Gérer le clic sur la notification
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, []);

  // Configurer les notifications en temps réel
  const setupRealtimeNotifications = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Nettoyer les anciens channels
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      // Créer un nouveau channel pour écouter toutes les transactions
      const channel = supabase
        .channel('transaction-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'deposits'
        }, (payload) => {
          const deposit = payload.new;
          const title = '💰 Nouveau versement';
          const body = `${deposit.client_name} - ${deposit.amount} TND`;
          
          toast.success(title, {
            description: body,
            duration: 4000,
          });
          
          showBrowserNotification(title, body);
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'withdrawals'
        }, (payload) => {
          const withdrawal = payload.new;
          const title = '💸 Nouveau retrait';
          const body = `${withdrawal.client_name} - ${withdrawal.amount} TND`;
          
          toast.info(title, {
            description: body,
            duration: 4000,
          });
          
          showBrowserNotification(title, body);
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'transfers'
        }, (payload) => {
          const transfer = payload.new;
          const title = '🔄 Nouveau virement';
          const body = `${transfer.from_client} → ${transfer.to_client} - ${transfer.amount} TND`;
          
          toast.info(title, {
            description: body,
            duration: 4000,
          });
          
          showBrowserNotification(title, body);
        })
        .subscribe((status) => {
          console.log('Statut notifications en temps réel:', status);
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
    }
  }, [showBrowserNotification]);

  // Nettoyer les subscriptions
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return {
    requestNotificationPermission,
    setupRealtimeNotifications,
    cleanup,
    notificationPermission: notificationPermission.current
  };
};
