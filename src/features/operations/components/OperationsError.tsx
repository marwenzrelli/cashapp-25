
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";

interface OperationsErrorProps {
  error: string | null;
  onRetry: () => void;
  showMockDataOption?: boolean;
  onUseMockData?: () => void;
}

export const OperationsError = ({ 
  error, 
  onRetry,
  showMockDataOption = false,
  onUseMockData
}: OperationsErrorProps) => {
  return (
    <div className="rounded-lg bg-red-50 p-6 text-center">
      <p className="text-red-600 mb-2">
        Erreur lors du chargement des opérations.
      </p>
      <p className="text-sm text-red-500 mb-4">
        {error}
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button 
          onClick={onRetry}
          variant="destructive"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
        
        {showMockDataOption && onUseMockData && (
          <Button 
            onClick={onUseMockData}
            variant="outline"
            className="border-yellow-400 bg-yellow-50 hover:bg-yellow-100 text-yellow-800"
          >
            <Database className="mr-2 h-4 w-4" />
            Utiliser les données de démonstration
          </Button>
        )}
        
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
