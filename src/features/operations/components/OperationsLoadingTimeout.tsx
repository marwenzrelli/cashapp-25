
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

interface OperationsLoadingTimeoutProps {
  onForceRefresh: () => void;
}

export const OperationsLoadingTimeout = ({ onForceRefresh }: OperationsLoadingTimeoutProps) => {
  return (
    <div className="rounded-lg bg-yellow-50 p-6 text-center">
      <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
      <p className="text-yellow-700 font-medium mb-2">
        Le chargement des opérations prend plus de temps que prévu.
      </p>
      <p className="text-sm text-yellow-600 mb-4">
        Cela peut être dû à une connexion lente ou à un problème de serveur. Vous pouvez continuer à attendre ou essayer les options ci-dessous.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button 
          onClick={onForceRefresh}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Forcer l'actualisation
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Recharger la page
        </Button>
      </div>
    </div>
  );
};
