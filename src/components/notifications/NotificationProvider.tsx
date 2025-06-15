
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';

interface NotificationContextType {
  isEnabled: boolean;
  requestPermission: () => Promise<void>;
  notificationPermission: NotificationPermission;
  isMobile: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { 
    requestNotificationPermission, 
    setupRealtimeNotifications, 
    cleanup,
    isMobile
  } = useNotifications();

  // Vérifier la permission au chargement
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setIsEnabled(Notification.permission === 'granted');
      
      // Log pour debug mobile
      if (isMobile) {
        console.log('NotificationProvider initialisé en mode mobile, permission:', Notification.permission);
      }
    }
  }, [isMobile]);

  // Configurer les notifications quand l'utilisateur est connecté
  useEffect(() => {
    const checkAuthAndSetup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isEnabled) {
        console.log('Configuration des notifications temps réel:', isMobile ? 'Mobile' : 'Desktop');
        await setupRealtimeNotifications();
      }
    };

    checkAuthAndSetup();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && isEnabled) {
        console.log('Utilisateur connecté - Configuration notifications:', isMobile ? 'Mobile' : 'Desktop');
        await setupRealtimeNotifications();
      } else if (event === 'SIGNED_OUT') {
        cleanup();
      }
    });

    return () => {
      subscription.unsubscribe();
      cleanup();
    };
  }, [isEnabled, setupRealtimeNotifications, cleanup, isMobile]);

  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    const enabled = permission === 'granted';
    setIsEnabled(enabled);
    
    if (enabled) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Permission accordée - Configuration:', isMobile ? 'Mobile' : 'Desktop');
        await setupRealtimeNotifications();
      }
    }
  };

  return (
    <NotificationContext.Provider value={{
      isEnabled,
      requestPermission,
      notificationPermission,
      isMobile
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
