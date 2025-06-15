
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNotifications = () => {
  const notificationPermission = useRef<NotificationPermission>('default');
  const channelRef = useRef<any>(null);

  // Vérifier la permission au chargement
  useEffect(() => {
    if ('Notification' in window) {
      notificationPermission.current = Notification.permission;
    }
  }, []);

  // Demander la permission pour les notifications
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications non supportées', {
        description: 'Votre navigateur ne supporte pas les notifications.',
      });
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      notificationPermission.current = permission;
      
      if (permission === 'granted') {
        toast.success('Notifications activées avec succès !', {
          description: 'Vous recevrez maintenant des notifications pour toutes les transactions.',
        });
      } else if (permission === 'denied') {
        toast.error('Permission refusée', {
          description: 'Pour activer les notifications :\n• Chrome/Edge : Cliquez sur le cadenas → Notifications → Autoriser\n• Firefox : Cliquez sur le bouclier → Paramètres → Autoriser\n• Safari : Préférences → Sites web → Notifications',
          duration: 10000,
        });
      } else {
        toast.warning('Permission en attente', {
          description: 'Vous pouvez réessayer plus tard.',
        });
      }
      
      return permission;
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      toast.error('Erreur', {
        description: 'Impossible de demander la permission de notification.',
      });
      return 'denied';
    }
  }, []);

  // Afficher une notification dans le navigateur
  const showBrowserNotification = useCallback((title: string, body: string, icon?: string) => {
    if ('Notification' in window && notificationPermission.current === 'granted') {
      try {
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
      } catch (error) {
        console.error('Erreur lors de l\'affichage de la notification:', error);
      }
    }
  }, []);

  // Configurer les notifications en temps réel
  const setupRealtimeNotifications = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('Aucune session active pour les notifications');
        return;
      }

      // Nettoyer les anciens channels
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      console.log('Configuration des notifications en temps réel...');

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
          if (status === 'SUBSCRIBED') {
            console.log('Notifications en temps réel activées avec succès');
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
      toast.error('Erreur de configuration', {
        description: 'Impossible de configurer les notifications en temps réel.',
      });
    }
  }, [showBrowserNotification]);

  // Nettoyer les subscriptions
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log('Nettoyage du channel de notifications');
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
