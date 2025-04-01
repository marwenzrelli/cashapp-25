
import { useEffect, useState } from "react";
import { isOnline } from "@/utils/network";

interface ConnectionStatusIndicatorProps {
  className?: string;
}

export const ConnectionStatusIndicator = ({ className = "" }: ConnectionStatusIndicatorProps) => {
  const [connected, setConnected] = useState(isOnline());
  
  // Check network status on mount and when it changes
  useEffect(() => {
    const checkOnlineStatus = () => {
      setConnected(isOnline());
    };
    
    // Initial check
    checkOnlineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    
    // Check every 5 seconds in case event listeners fail
    const intervalId = setInterval(checkOnlineStatus, 5000);
    
    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`h-3 w-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {connected ? "Vous êtes connecté à Internet" : "Vous êtes actuellement hors ligne"}
      </p>
    </div>
  );
};
