
import { ErrorState } from "@/features/admin/components/administration/ErrorState";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface NoUserProfileStateProps {
  isRetrying: boolean;
  onRetry: () => void;
}

export const NoUserProfileState = ({
  isRetrying,
  onRetry
}: NoUserProfileStateProps) => {
  return (
    <ErrorState errorMessage="Profil utilisateur non disponible">
      <div className="mt-4 space-y-4">
        <p className="text-muted-foreground">
          Impossible de charger les informations de votre profil.
          Veuillez vous reconnecter ou contactez l'administrateur.
        </p>
        <Button 
          onClick={onRetry} 
          variant="outline"
          className="flex items-center gap-2"
          disabled={isRetrying}
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Chargement en cours...' : 'Réessayer'}
        </Button>
      </div>
    </ErrorState>
  );
};
