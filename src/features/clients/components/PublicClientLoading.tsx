
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { RefreshCw } from "lucide-react";

interface PublicClientLoadingProps {
  onRetry?: () => void;
  timeout?: boolean;
  timeoutMessage?: string;
}

export const PublicClientLoading = ({ 
  onRetry, 
  timeout = false,
  timeoutMessage = "Le chargement prend plus de temps que prévu..."
}: PublicClientLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md">
        <LoadingIndicator 
          size="lg" 
          text={timeout ? timeoutMessage : "Chargement des données du client..."} 
          className="mb-8"
        />
        
        {timeout && onRetry && (
          <div className="flex flex-col items-center mt-6">
            <p className="text-muted-foreground mb-4 text-center">
              Il semble y avoir un problème avec la connexion.
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
