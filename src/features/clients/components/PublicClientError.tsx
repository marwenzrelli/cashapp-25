
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home, Network, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PublicClientErrorProps {
  error: string | null;
  onRetry?: () => void;
}

export const PublicClientError = ({ error, onRetry }: PublicClientErrorProps) => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
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

  // Listen for online event to auto-retry
  useEffect(() => {
    const handleOnline = () => {
      if (error && onRetry && retryCount === 0) {
        toast.info("Connexion internet rétablie", {
          description: "Tentative de reconnexion automatique..."
        });
        setTimeout(() => {
          handleRetry();
        }, 1000);
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [error, onRetry, retryCount]);
  
  // Show a toast when an error occurs
  useEffect(() => {
    if (error) {
      toast.error("Erreur de chargement", {
        description: error
      });
    }
  }, [error]);
  
  const handleRetry = () => {
    if (onRetry && !isRetrying) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      
      console.log("Retrying client fetch...");
      toast.info("Nouvelle tentative", {
        description: "Tentative de reconnexion au serveur..."
      });
      
      // Tentative de réessai avec délai progressif
      setTimeout(() => {
        onRetry();
        setIsRetrying(false);
      }, retryCount * 500); // Délai progressif entre les tentatives
    }
  };

  // Determine if this is a client not found error
  const isClientNotFoundError = error && (
    error.includes("Client introuvable") || 
    error.includes("n'existe pas")
  );
  
  // Check if it's a connection error
  const isConnectionError = error && (
    error.includes("interrompue") || 
    error.includes("délai d'attente") ||
    error.includes("connexion") ||
    error.includes("timeout") ||
    error.includes("réseau") ||
    !isOnline
  );
  
  // Check if it's an access error
  const isAccessError = error && (
    error.includes("Token") ||
    error.includes("accès") ||
    error.includes("invalide") ||
    error.includes("expiré")
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100/30 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-950 shadow-xl rounded-xl p-8 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            {isConnectionError ? (
              !isOnline ? <WifiOff className="h-8 w-8 text-red-600 dark:text-red-500" /> : 
                         <Network className="h-8 w-8 text-red-600 dark:text-red-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            )}
          </div>
        </div>
        
        <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
          {isClientNotFoundError ? "Client introuvable" : 
           isConnectionError ? "Erreur de connexion" : 
           isAccessError ? "Erreur d'accès" : "Erreur d'accès"}
        </h2>
        
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {error || "Impossible d'accéder au profil client. Le lien pourrait être invalide ou expiré."}
        </p>
        
        {isClientNotFoundError && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Veuillez vérifier l'URL ou contacter le support si vous pensez qu'il s'agit d'une erreur.
          </p>
        )}
        
        {isConnectionError && (
          <>
            <div className="mt-4 mb-2">
              <div className="flex items-center justify-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isOnline ? "Vous êtes connecté à Internet" : "Vous êtes actuellement hors ligne"}
                </p>
              </div>
            </div>
            
            <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {isOnline 
                  ? "Le serveur semble temporairement inaccessible. Cela peut être dû à une maintenance ou à une charge élevée." 
                  : "Veuillez activer votre connexion internet et réessayer."}
              </p>
            </div>
          </>
        )}

        {isAccessError && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Le lien d'accès utilisé n'est pas valide ou a expiré. Veuillez demander un nouveau lien d'accès.
          </p>
        )}
        
        <div className="mt-8 space-y-3">
          {onRetry && (
            <Button 
              onClick={handleRetry}
              className="w-full gap-2"
              variant={isConnectionError ? "default" : "outline"}
              disabled={!isOnline || isRetrying}
            >
              <RefreshCcw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Tentative en cours...' : 'Réessayer'}
            </Button>
          )}
          
          <Button 
            onClick={() => navigate('/clients')}
            className="w-full gap-2"
            variant={isConnectionError ? "outline" : "default"}
          >
            <Home className="h-4 w-4" />
            Retourner à la liste des clients
          </Button>
        </div>
      </div>
    </div>
  );
};
