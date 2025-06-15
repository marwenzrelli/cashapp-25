
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useNotificationContext } from './NotificationProvider';
import { cn } from '@/lib/utils';

interface NotificationButtonProps {
  className?: string;
}

export const NotificationButton = ({ className }: NotificationButtonProps) => {
  const { isEnabled, requestPermission, notificationPermission } = useNotificationContext();

  const handleClick = () => {
    if (notificationPermission !== 'granted') {
      requestPermission();
    }
  };

  const getIcon = () => {
    if (notificationPermission === 'denied') {
      return <BellOff className="h-5 w-5 text-red-500" />;
    }
    if (isEnabled) {
      return <Bell className="h-5 w-5 text-green-500" />;
    }
    return <Bell className="h-5 w-5 text-gray-500" />;
  };

  const getTitle = () => {
    if (notificationPermission === 'denied') {
      return 'Notifications bloquées - Cliquez pour réessayer';
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
    >
      {getIcon()}
      {isEnabled && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}
    </Button>
  );
};
