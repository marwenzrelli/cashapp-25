
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
      
      // Sur mobile, nous devons d'abord vérifier si l'utilisateur peut interagir
      if (isMobile()) {
        // Sur mobile, nous devons nous assurer que la demande est déclenchée par un geste utilisateur
        console.log('Demande de permission sur mobile...');
        
        // Certains navigateurs mobiles nécessitent une interaction utilisateur
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

        // Test immédiat sur mobile pour vérifier que ça fonctionne
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
          requireInteraction: isMobile(), // Sur mobile, garder la notification visible plus longtemps
          silent: false,
          // Options spécifiques pour mobile
          ...(isMobile() && {
            vibrate: [100, 50, 100], // Vibration sur mobile
            renotify: true,
          })
        });

        // Sur mobile, fermer automatiquement après plus de temps
        const autoCloseTime = isMobile() ? 8000 : 5000;
        setTimeout(() => {
          notification.close();
        }, autoCloseTime);

        // Gérer le clic sur la notification
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Sur mobile, essayer de ramener l'app au premier plan
          if (isMobile() && 'navigator' in window && 'serviceWorker' in navigator) {
            // Focus sur la fenêtre principale
            if (window.parent !== window) {
              window.parent.focus();
            }
          }
        };

        // Log pour debug mobile
        if (isMobile()) {
          console.log('Notification mobile envoyée:', title);
        }
      } catch (error) {
        console.error('Erreur lors de l\'affichage de la notification:', error);
        
        // Fallback pour mobile si la notification échoue
        if (isMobile()) {
          toast.info(title, {
            description: body,
            duration: 6000,
          });
        }
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

      console.log('Configuration des notifications en temps réel...', isMobile() ? '(Mobile)' : '(Desktop)');

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
          const title = '💸 Nouveau retrait';
          const body = `${withdrawal.client_name} - ${withdrawal.amount} TND`;
          
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
          const title = '🔄 Nouveau virement';
          const body = `${transfer.from_client} → ${transfer.to_client} - ${transfer.amount} TND`;
          
          toast.info(title, {
            description: body,
            duration: isMobile() ? 6000 : 4000,
          });
          
          showBrowserNotification(title, body);
        })
        .subscribe((status) => {
          console.log('Statut notifications en temps réel:', status, isMobile() ? '(Mobile)' : '(Desktop)');
          if (status === 'SUBSCRIBED') {
            console.log('Notifications en temps réel activées avec succès');
            
            // Message de confirmation spécifique pour mobile
            if (isMobile()) {
              toast.success('🔔 Mode mobile activé', {
                description: 'Les notifications fonctionnent maintenant sur votre appareil mobile',
                duration: 3000,
              });
            }
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
