
import React, { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { ConnectionStatusIndicator } from "./ConnectionStatusIndicator";
import { Button } from "@/components/ui/button";
import { isOnline } from "@/utils/network";

interface OfflineNoticeProps {
  onRetry?: () => void;
  className?: string;
}

export const OfflineNotice = ({ onRetry, className = "" }: OfflineNoticeProps) => {
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      const online = isOnline();
      setIsOffline(!online);
      
      // Show status indicator after checking
      if (!showIndicator) {
        setShowIndicator(true);
      }
    };
    
    // Check immediately
    checkConnection();
    
    // Set up event listeners
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    // Check periodically
    const intervalId = setInterval(checkConnection, 10000);
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
      clearInterval(intervalId);
    };
  }, [showIndicator]);

  if (!isOffline) {
    return null;
  }

  return (
    <div className={`rounded-lg bg-red-50 dark:bg-red-950/30 p-4 mb-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 dark:bg-red-900/40 rounded-full p-2">
            <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-medium">Vous êtes hors ligne</h3>
            <p className="text-sm text-muted-foreground">
              Vérifiez votre connexion internet
            </p>
          </div>
        </div>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="shrink-0"
          >
            Réessayer
          </Button>
        )}
      </div>
      
      {showIndicator && (
        <div className="mt-3 pt-3 border-t">
          <ConnectionStatusIndicator />
        </div>
      )}
    </div>
  );
};
