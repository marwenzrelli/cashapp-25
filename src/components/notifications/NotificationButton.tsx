
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, RefreshCw } from 'lucide-react';
import { useNotificationContext } from './NotificationProvider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationButtonProps {
  className?: string;
}

export const NotificationButton = ({ className }: NotificationButtonProps) => {
  const { isEnabled, requestPermission, notificationPermission } = useNotificationContext();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleClick = async () => {
    if (notificationPermission === 'denied') {
      // Afficher des instructions détaillées
      toast.error('Notifications bloquées', {
        description: 'Pour activer les notifications :\n1. Cliquez sur l\'icône de cadenas dans la barre d\'adresse\n2. Changez "Notifications" à "Autoriser"\n3. Rechargez la page',
        duration: 8000,
      });
      return;
    }

    if (notificationPermission !== 'granted') {
      setIsRequesting(true);
      try {
        await requestPermission();
      } finally {
        setIsRequesting(false);
      }
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
      return <Bell className="h-5 w-5 text-green-500" />;
    }
    return <Bell className="h-5 w-5 text-gray-500" />;
  };

  const getTitle = () => {
    if (isRequesting) {
      return 'Demande de permission en cours...';
    }
    if (notificationPermission === 'denied') {
      return 'Notifications bloquées - Cliquez pour voir les instructions';
    }
    if (isEnabled) {
      return 'Notifications activées';
    }
    return 'Activer les notifications';
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
    </Button>
  );
};
