
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PublicClientErrorProps {
  error: string | null;
  onRetry?: () => void;
}

export const PublicClientError = ({ error, onRetry }: PublicClientErrorProps) => {
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Show a toast when an error occurs
  useEffect(() => {
    if (error) {
      toast.error("Erreur de chargement", {
        description: error
      });
    }
  }, [error]);
  
  const handleRetry = () => {
    if (onRetry) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      
      console.log("Nouvelle tentative de récupération des données client...");
      
      // Petit délai pour montrer que quelque chose se passe
      setTimeout(() => {
        onRetry();
        setTimeout(() => setIsRetrying(false), 1000);
      }, 500);
    }
  };

  // Determine if this is a client not found error
  const isClientNotFoundError = error && (
    error.includes("Client introuvable") || 
    error.includes("n'existe pas")
  );
  
  const isNetworkError = error && (
    error.includes("requête") ||
    error.includes("interrompue") ||
    error.includes("délai") ||
    error.includes("Délai") ||
    error.includes("timeout") ||
    error.includes("dépassé")
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100/30 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-950 shadow-xl rounded-xl p-8 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
          </div>
        </div>
        
        <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
          {isClientNotFoundError ? "Client introuvable" : "Erreur d'accès"}
        </h2>
        
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {error || "Impossible d'accéder au profil client. Le lien pourrait être invalide ou expiré."}
        </p>
        
        {isClientNotFoundError && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Veuillez vérifier l'URL ou contacter le support si vous pensez qu'il s'agit d'une erreur.
          </p>
        )}
        
        {isNetworkError && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Problème de connexion réseau. Veuillez vérifier votre connexion internet et réessayer.
          </p>
        )}
        
        <div className="mt-8 space-y-3">
          {onRetry && (
            <Button 
              onClick={handleRetry}
              className="w-full gap-2"
              variant="outline"
              disabled={isRetrying}
            >
              <RefreshCcw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Tentative en cours...' : (
                retryCount > 0 ? `Réessayer (${retryCount + 1})` : 'Réessayer'
              )}
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.reload()}
            className="w-full gap-2"
            variant="outline"
          >
            <ExternalLink className="h-4 w-4" />
            Rafraîchir la page
          </Button>
          
          <Button 
            onClick={() => navigate('/clients')}
            className="w-full gap-2"
          >
            <Home className="h-4 w-4" />
            Retourner à la liste des clients
          </Button>
        </div>
      </div>
    </div>
  );
};
