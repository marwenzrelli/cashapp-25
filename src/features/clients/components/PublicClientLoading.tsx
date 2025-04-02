
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
  const [initialAnimComplete, setInitialAnimComplete] = useState(false);
  
  // Ajouter un effet de transition progressive avec phases
  useEffect(() => {
    // Phase 1: Affichage initial rapide
    setFadeIn(true);
    
    // Phase 2: Animation complète après un court délai
    const timer = setTimeout(() => {
      setInitialAnimComplete(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update timeout status based on loading time
  useEffect(() => {
    // Show timeout message after 6 seconds (réduit de 8 à 6)
    if (loadingTime >= 6 && !showTimeoutMessage) {
      setShowTimeoutMessage(true);
    }
  }, [loadingTime, showTimeoutMessage]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-[80vh] p-4 transition-all duration-300 ease-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="w-full max-w-md">
        <LoadingIndicator 
          size="lg" 
          text={showTimeoutMessage ? timeoutMessage : "Chargement des données du client..."} 
          className="mb-8"
          fadeIn={false}
          showImmediately={true}
        />
        
        {showTimeoutMessage && onRetry && (
          <div className={`flex flex-col items-center mt-6 transition-all duration-300 ${initialAnimComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <p className="text-muted-foreground mb-4 text-center">
              Il semble y avoir un problème avec la connexion.
              {loadingTime > 0 && (
                <span className="block mt-2 text-sm">
                  Temps d'attente: {loadingTime} secondes
                </span>
              )}
            </p>
            <Button 
              onClick={onRetry} 
              className="gap-2 relative overflow-hidden"
              disabled={loadingTime < 2} // Empêcher de cliquer trop rapidement
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
