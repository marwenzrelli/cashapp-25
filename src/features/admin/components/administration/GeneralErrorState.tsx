
import { ErrorState } from "@/features/admin/components/administration/ErrorState";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface GeneralErrorStateProps {
  errorMessage: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const GeneralErrorState = ({
  errorMessage,
  isRetrying,
  onRetry
}: GeneralErrorStateProps) => {
  return (
    <ErrorState errorMessage={errorMessage}>
      <div className="mt-4 space-y-4">
        <p className="text-muted-foreground">
          {errorMessage || "Une erreur s'est produite lors du chargement des données"}
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
