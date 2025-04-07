
import { useEffect, useState, useRef } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Database } from "lucide-react";

interface OperationsLoadingProps {
  loadingDuration: number;
  showNetworkError: boolean;
  onForceRefresh: () => void;
  showMockDataOption?: boolean;
  onUseMockData?: () => void;
}

export const OperationsLoading = ({ 
  loadingDuration, 
  showNetworkError, 
  onForceRefresh,
  showMockDataOption = false,
  onUseMockData
}: OperationsLoadingProps) => {
  return (
    <div className="py-12 flex flex-col items-center justify-center">
      <LoadingIndicator 
        text={`Chargement des opérations... ${loadingDuration > 3 ? `(${loadingDuration}s)` : ''}`}
        size="lg" 
        showImmediately={true}
      />
      
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button 
          onClick={onForceRefresh}
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Force l'actualisation
        </Button>

        {showMockDataOption && onUseMockData && (
          <Button 
            onClick={onUseMockData}
            variant="outline"
            className="bg-yellow-50 border-yellow-300 hover:bg-yellow-100 text-yellow-800"
          >
            <Database className="mr-2 h-4 w-4" />
            Utiliser les données de démonstration
          </Button>
        )}
      </div>
      
      {showNetworkError && (
        <div className="mt-6 max-w-md p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
          <p className="text-sm text-yellow-700 mb-2">
            Le chargement prend plus de temps que prévu.
          </p>
          <p className="text-xs text-yellow-600">
            Vérifiez votre connexion réseau ou essayez de rafraîchir la page.
          </p>
        </div>
      )}
    </div>
  );
};
