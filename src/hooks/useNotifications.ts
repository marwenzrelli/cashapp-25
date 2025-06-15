
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

  // Détecter si on est sur mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Demander la permission pour les notifications
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications non supportées', {
        description: 'Votre navigateur ne supporte pas les notifications.',
      });
      return 'denied';
    }

    try {
      let permission: NotificationPermission;
      
      if (isMobile()) {
        console.log('Demande de permission sur mobile...');
        await new Promise(resolve => {
          setTimeout(resolve, 100);
        });
      }

      permission = await Notification.requestPermission();
      notificationPermission.current = permission;
      
      if (permission === 'granted') {
        toast.success('Notifications activées !', {
          description: isMobile() 
            ? 'Vous recevrez des notifications même quand l\'app est en arrière-plan.'
            : 'Vous recevrez maintenant des notifications pour toutes les transactions.',
        });

        if (isMobile()) {
          setTimeout(() => {
            try {
              new Notification('Test de notification', {
                body: 'Les notifications fonctionnent sur votre appareil mobile !',
                icon: '/favicon.ico',
                tag: 'test-notification',
                requireInteraction: false,
              });
            } catch (error) {
              console.log('Test de notification échoué:', error);
            }
          }, 500);
        }
      } else if (permission === 'denied') {
        if (isMobile()) {
          toast.error('Notifications bloquées', {
            description: 'Pour les activer :\n• Ouvrez les paramètres de votre navigateur\n• Cherchez "Notifications" ou "Autorisations"\n• Activez les notifications pour ce site\n• Rechargez la page',
            duration: 12000,
          });
        } else {
          toast.error('Permission refusée', {
            description: 'Pour activer les notifications :\n• Chrome/Edge : Cliquez sur le cadenas → Notifications → Autoriser\n• Firefox : Cliquez sur le bouclier → Paramètres → Autoriser\n• Safari : Préférences → Sites web → Notifications',
            duration: 10000,
          });
        }
      } else {
        toast.warning('Permission en attente', {
          description: isMobile() 
            ? 'Veuillez autoriser les notifications dans la popup qui va apparaître.'
            : 'Vous pouvez réessayer plus tard.',
        });
      }
      
      return permission;
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      toast.error('Erreur', {
        description: isMobile() 
          ? 'Impossible de demander les notifications. Vérifiez les paramètres de votre navigateur.'
          : 'Impossible de demander la permission de notification.',
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
          requireInteraction: isMobile(),
          silent: false,
          ...(isMobile() && {
            vibrate: [100, 50, 100],
            renotify: true,
          })
        });

        const autoCloseTime = isMobile() ? 8000 : 5000;
        setTimeout(() => {
          notification.close();
        }, autoCloseTime);

        notification.onclick = () => {
          window.focus();
          notification.close();
          
          if (isMobile() && 'navigator' in window && 'serviceWorker' in navigator) {
            if (window.parent !== window) {
              window.parent.focus();
            }
          }
        };

        if (isMobile()) {
          console.log('Notification mobile envoyée:', title);
        }
      } catch (error) {
        console.error('Erreur lors de l\'affichage de la notification:', error);
        
        if (isMobile()) {
          toast.info(title, {
            description: body,
            duration: 6000,
          });
        }
      }
    }
  }, []);

  // Configurer les notifications en temps réel pour TOUS les mouvements
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

      console.log('Configuration des notifications pour TOUS les mouvements...', isMobile() ? '(Mobile)' : '(Desktop)');

      // Créer un nouveau channel pour écouter TOUTES les transactions
      const channel = supabase
        .channel('all-transaction-notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'deposits'
        }, (payload) => {
          const deposit = payload.new;
          const title = '💰 Nouveau versement reçu';
          const body = `Client: ${deposit.client_name}\nMontant: ${deposit.amount} TND`;
          
          console.log('Notification versement:', deposit);
          
          toast.success(title, {
            description: body,
            duration: isMobile() ? 6000 : 4000,
          });
          
          showBrowserNotification(title, body);
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'withdrawals'
        }, (payload) => {
          const withdrawal = payload.new;
          const title = '💸 Nouveau retrait effectué';
          const body = `Client: ${withdrawal.client_name}\nMontant: ${withdrawal.amount} TND`;
          
          console.log('Notification retrait:', withdrawal);
          
          toast.info(title, {
            description: body,
            duration: isMobile() ? 6000 : 4000,
          });
          
          showBrowserNotification(title, body);
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'transfers'
        }, (payload) => {
          const transfer = payload.new;
          const title = '🔄 Nouveau virement réalisé';
          const body = `De: ${transfer.from_client}\nVers: ${transfer.to_client}\nMontant: ${transfer.amount} TND`;
          
          console.log('Notification virement:', transfer);
          
          toast.info(title, {
            description: body,
            duration: isMobile() ? 6000 : 4000,
          });
          
          showBrowserNotification(title, body);
        })
        .subscribe((status) => {
          console.log('Statut notifications temps réel:', status, isMobile() ? '(Mobile)' : '(Desktop)');
          if (status === 'SUBSCRIBED') {
            console.log('✅ Notifications activées pour TOUS les mouvements');
            
            if (isMobile()) {
              toast.success('📱 Mode mobile activé', {
                description: 'Vous recevrez toutes les notifications de mouvements',
                duration: 3000,
              });
            } else {
              toast.success('🔔 Notifications activées', {
                description: 'Vous recevrez toutes les notifications de mouvements',
                duration: 3000,
              });
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Erreur de connexion notifications');
            toast.error('Erreur notifications', {
              description: 'Impossible de configurer les notifications en temps réel',
            });
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
      toast.error('Erreur de configuration', {
        description: isMobile() 
          ? 'Impossible de configurer les notifications mobiles.'
          : 'Impossible de configurer les notifications en temps réel.',
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
    notificationPermission: notificationPermission.current,
    isMobile: isMobile()
  };
};
