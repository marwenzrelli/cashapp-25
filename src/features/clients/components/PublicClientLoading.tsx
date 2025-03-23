
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface PublicClientLoadingProps {
  onRetry?: () => void;
  timeout?: boolean;
  timeoutMessage?: string;
  loadingTime?: number;
}

export const PublicClientLoading = ({ 
  onRetry, 
  timeout = false,
  timeoutMessage = "Le chargement prend plus de temps que prévu...",
  loadingTime = 0
}: PublicClientLoadingProps) => {
  // Auto-enable timeout message after a certain threshold
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(timeout);
  const [fadeIn, setFadeIn] = useState(false);
  
  // Ajouter un effet de transition progressive
  useEffect(() => {
    // Léger délai avant de commencer l'animation
    const timer = setTimeout(() => {
      setFadeIn(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update timeout status based on loading time
  useEffect(() => {
    // Show timeout message after 10 seconds
    if (loadingTime >= 10 && !showTimeoutMessage) {
      setShowTimeoutMessage(true);
    }
  }, [loadingTime, showTimeoutMessage]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-[80vh] p-4 transition-all duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-full max-w-md">
        <LoadingIndicator 
          size="lg" 
          text={showTimeoutMessage ? timeoutMessage : "Chargement des données du client..."} 
          className="mb-8"
          fadeIn={true}
        />
        
        {showTimeoutMessage && onRetry && (
          <div className="flex flex-col items-center mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-muted-foreground mb-4 text-center">
              Il semble y avoir un problème avec la connexion.
              {loadingTime > 0 && (
                <span className="block mt-2 text-sm">
                  Temps d'attente: {loadingTime} secondes
                </span>
              )}
            </p>
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
