
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { LoadingState } from "@/features/admin/components/administration/LoadingState";
import { GeneralErrorState } from "@/features/admin/components/administration/GeneralErrorState";

interface NetworkStatusAlertsProps {
  networkStatus: 'online' | 'offline' | 'reconnecting';
  isLoading: boolean;
  retrying: boolean;
  error: string | null;
  fetchWithdrawals: () => void;
}

export const NetworkStatusAlerts: React.FC<NetworkStatusAlertsProps> = ({
  networkStatus,
  isLoading,
  retrying,
  error,
  fetchWithdrawals
}) => {
  if (networkStatus === 'offline') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <Alert variant="destructive" className="mb-6">
          <WifiOff className="h-5 w-5 mr-2" />
          <AlertTitle>Connexion Internet perdue</AlertTitle>
          <AlertDescription>
            Veuillez vérifier votre connexion internet et réessayer.
          </AlertDescription>
        </Alert>
        <GeneralErrorState 
          errorMessage="Problème de connexion réseau"
          isRetrying={isLoading} 
          onRetry={fetchWithdrawals}
        />
      </div>
    );
  }

  if (networkStatus === 'reconnecting') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <Wifi className="h-5 w-5 mr-2 text-yellow-600" />
          <AlertTitle>Tentative de reconnexion...</AlertTitle>
          <AlertDescription>
            Nous essayons de rétablir la connexion avec le serveur.
          </AlertDescription>
        </Alert>
        <LoadingState message="Tentative de reconnexion en cours..." retrying={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
          <AlertTitle>Problème de chargement</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
};
