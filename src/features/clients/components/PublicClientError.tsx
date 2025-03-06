
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PublicClientErrorProps {
  error: string | null;
  onRetry?: () => void;
}

export const PublicClientError = ({ error, onRetry }: PublicClientErrorProps) => {
  const navigate = useNavigate();
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // Determine if this is a client not found error
  const isClientNotFoundError = error && error.includes("Client introuvable");
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100/30 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-950 shadow-xl rounded-xl p-8 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
          </div>
        </div>
        
        <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
          {isClientNotFoundError ? "Client introuvable" : "Accès refusé"}
        </h2>
        
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          {error || "Impossible d'accéder au profil client. Le lien pourrait être invalide ou expiré."}
        </p>
        
        {isClientNotFoundError && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Veuillez vérifier l'URL ou contacter le support si vous pensez qu'il s'agit d'une erreur.
          </p>
        )}
        
        <div className="mt-8 space-y-3">
          {onRetry && !isClientNotFoundError && (
            <Button 
              onClick={handleRetry}
              className="w-full gap-2"
              variant="outline"
            >
              <RefreshCcw className="h-4 w-4" />
              Réessayer
            </Button>
          )}
          
          <Button 
            onClick={() => navigate('/')}
            className="w-full gap-2"
          >
            <Home className="h-4 w-4" />
            Retourner à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};
