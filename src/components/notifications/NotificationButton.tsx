
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, RefreshCw, Smartphone } from 'lucide-react';
import { useNotificationContext } from './NotificationProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationButtonProps {
  className?: string;
}

export const NotificationButton = ({ className }: NotificationButtonProps) => {
  const { isEnabled, requestPermission, notificationPermission, isMobile } = useNotificationContext();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleClick = async () => {
    if (notificationPermission === 'denied') {
      // Instructions spécifiques pour mobile vs desktop
      if (isMobile) {
        toast.error('Notifications bloquées sur mobile', {
          description: 'Pour les activer :\n1. Ouvrez les paramètres de votre navigateur\n2. Cherchez "Notifications" ou "Autorisations"\n3. Trouvez ce site et activez les notifications\n4. Rechargez cette page',
          duration: 10000,
        });
      } else {
        toast.error('Notifications bloquées', {
          description: 'Pour activer les notifications :\n1. Cliquez sur l\'icône de cadenas dans la barre d\'adresse\n2. Changez "Notifications" à "Autoriser"\n3. Rechargez la page',
          duration: 8000,
        });
      }
      return;
    }

    if (notificationPermission !== 'granted') {
      setIsRequesting(true);
      try {
        // Sur mobile, ajouter un délai pour s'assurer que l'interaction utilisateur est bien détectée
        if (isMobile) {
          toast.info('Demande en cours...', {
            description: 'Une popup va apparaître pour autoriser les notifications',
            duration: 3000,
          });
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        await requestPermission();
      } finally {
        setIsRequesting(false);
      }
    } else {
      // Si déjà activées, montrer le statut
      toast.success('Notifications activées', {
        description: isMobile 
          ? 'Vous recevrez des notifications même en arrière-plan'
          : 'Vous recevrez toutes les notifications en temps réel',
        duration: 3000,
      });
    }
  };

  const getIcon = () => {
    if (isRequesting) {
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    if (notificationPermission === 'denied') {
      return <BellOff className="h-5 w-5 text-red-500" />;
    }
    if (isEnabled) {
      // Icône différente pour mobile pour indiquer que c'est optimisé
      return isMobile ? (
        <div className="relative">
          <Smartphone className="h-5 w-5 text-green-500" />
          <Bell className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
        </div>
      ) : (
        <Bell className="h-5 w-5 text-green-500" />
      );
    }
    return <Bell className="h-5 w-5 text-gray-500" />;
  };

  const getTitle = () => {
    if (isRequesting) {
      return isMobile 
        ? 'Demande de permission mobile en cours...'
        : 'Demande de permission en cours...';
    }
    if (notificationPermission === 'denied') {
      return isMobile 
        ? 'Notifications bloquées - Cliquez pour voir les instructions mobiles'
        : 'Notifications bloquées - Cliquez pour voir les instructions';
    }
    if (isEnabled) {
      return isMobile 
        ? 'Notifications mobiles activées'
        : 'Notifications activées';
    }
    return isMobile 
      ? 'Activer les notifications mobiles'
      : 'Activer les notifications';
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      title={getTitle()}
      className={cn("relative", className)}
      disabled={isRequesting}
    >
      {getIcon()}
      {isEnabled && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}
      {/* Indicateur mobile */}
      {isMobile && (
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </Button>
  );
};
