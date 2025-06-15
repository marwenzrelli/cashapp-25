
import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebNotifications } from '@/hooks/useWebNotifications';
import { useTransactionNotifications } from '@/hooks/useTransactionNotifications';
import { toast } from 'sonner';

export const NotificationManager = () => {
  const { permission, isSupported, requestPermission } = useWebNotifications();
  const { isActive } = useTransactionNotifications();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show notification prompt after a delay if not already granted
    if (isSupported && permission === 'default') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPrompt(false);
    }
  };

  const handleDismissPrompt = () => {
    setShowPrompt(false);
    toast.info('Vous pouvez activer les notifications plus tard via le bouton cloche');
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Notification status button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={permission === 'granted' ? undefined : handleEnableNotifications}
        className={`relative ${permission === 'granted' ? 'text-green-600' : 'text-gray-400'}`}
        title={
          permission === 'granted' 
            ? 'Notifications actives' 
            : 'Cliquer pour activer les notifications'
        }
      >
        {permission === 'granted' ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5" />
        )}
        
        {isActive && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Notification prompt */}
      {showPrompt && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-sm">Notifications en temps réel</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Recevez des notifications pour chaque nouvelle transaction dans le système
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleEnableNotifications}
                  className="text-xs"
                >
                  Activer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissPrompt}
                  className="text-xs"
                >
                  Plus tard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
