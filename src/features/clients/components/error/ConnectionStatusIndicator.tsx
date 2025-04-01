
import { useEffect, useState } from "react";

interface ConnectionStatusIndicatorProps {
  className?: string;
}

export const ConnectionStatusIndicator = ({ className = "" }: ConnectionStatusIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(true);
  
  // Check network status on mount and when it changes
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    // Initial check
    checkOnlineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    
    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`h-3 w-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {isOnline ? "Vous êtes connecté à Internet" : "Vous êtes actuellement hors ligne"}
      </p>
    </div>
  );
};
