
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Database } from "lucide-react";

interface OperationsLoadingTimeoutProps {
  onForceRefresh: () => void;
  showMockDataOption?: boolean;
  onUseMockData?: () => void;
}

export const OperationsLoadingTimeout = ({ 
  onForceRefresh,
  showMockDataOption = false,
  onUseMockData
}: OperationsLoadingTimeoutProps) => {
  return (
    <div className="rounded-lg bg-yellow-50 p-6 text-center">
      <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-yellow-800 mb-2">
        Le chargement des opérations prend plus de temps que prévu
      </h3>
      <p className="text-yellow-700 mb-6">
        Il semble que nous ayons des difficultés à récupérer les données. Veuillez réessayer ou utiliser les données de démonstration.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button 
          onClick={onForceRefresh}
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>

        {showMockDataOption && onUseMockData && (
          <Button 
            onClick={onUseMockData}
            variant="default"
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Database className="mr-2 h-4 w-4" />
            Utiliser les données de démonstration
          </Button>
        )}
      </div>
    </div>
  );
};
