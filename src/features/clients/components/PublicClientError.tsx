
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorIcon } from "./error/ErrorIcon";
import { ErrorMessages } from "./error/ErrorMessages";
import { ConnectionStatusIndicator } from "./error/ConnectionStatusIndicator";
import { RetryButton } from "./error/RetryButton";
import { isOnline, isNetworkError } from "@/utils/network";

interface PublicClientErrorProps {
  error: string | null;
  onRetry?: () => void;
}

export const PublicClientError = ({ error, onRetry }: PublicClientErrorProps) => {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(isOnline());
  const [retryCount, setRetryCount] = useState(0);
  const [errorType, setErrorType] = useState<"client" | "connection" | "server" | "access" | "unknown">("unknown");
  
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
          if (onRetry) onRetry();
        }, 1500); // Delay to allow network to stabilize
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
  
  // Determine error type
  useEffect(() => {
    if (!error) {
      setErrorType("unknown");
      return;
    }
    
    if (error.includes("Client introuvable") || error.includes("n'existe pas")) {
      setErrorType("client");
    } else if (isNetworkError(error) || !connected) {
      setErrorType("connection");
    } else if (error.includes("serveur") || error.includes("temporairement")) {
      setErrorType("server");
    } else if (error.includes("Token") ||
        error.includes("accès") ||
        error.includes("invalide") ||
        error.includes("expiré")) {
      setErrorType("access");
    } else {
      setErrorType("unknown");
    }
  }, [error, connected]);
  
  const getErrorTitle = () => {
    switch (errorType) {
      case "client": return "Client introuvable";
      case "server": return "Serveur indisponible";
      case "connection": return "Erreur de connexion";
      case "access": return "Erreur d'accès";
      default: return "Erreur d'accès";
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100/30 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-950 shadow-xl rounded-xl p-8 text-center">
        <div className="flex justify-center">
          <ErrorIcon errorType={errorType} isOnline={connected} />
        </div>
        
        <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
          {getErrorTitle()}
        </h2>
        
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {error || "Impossible d'accéder au profil client. Le lien pourrait être invalide ou expiré."}
        </p>
        
        {errorType === "client" && <ErrorMessages errorType="client" errorMessage={error} />}
        {errorType === "server" && <ErrorMessages errorType="server" errorMessage={error} />}
        
        {errorType === "connection" && (
          <>
            <div className="mt-4 mb-2">
              <ConnectionStatusIndicator />
            </div>
            <ErrorMessages errorType="connection" errorMessage={error} />
          </>
        )}

        {errorType === "access" && <ErrorMessages errorType="access" errorMessage={error} />}
        
        <div className="mt-8 space-y-3">
          {onRetry && (
            <RetryButton 
              onRetry={onRetry}
              isOnline={connected}
              retryCount={retryCount}
              setRetryCount={setRetryCount}
            />
          )}
          
          <Button 
            onClick={() => navigate('/clients')}
            className="w-full gap-2"
            variant={errorType === "connection" || errorType === "server" ? "outline" : "default"}
          >
            <Home className="h-4 w-4" />
            Retourner à la liste des clients
          </Button>
        </div>
      </div>
    </div>
  );
};
