
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface PublicClientErrorProps {
  error: string | null;
}

export const PublicClientError = ({ error }: PublicClientErrorProps) => {
  // Determine if the error is related to network connectivity
  const isNetworkError = error?.toLowerCase().includes('network') || 
                         error?.toLowerCase().includes('connexion') ||
                         error?.toLowerCase().includes('internet');

  const isExpiredError = error?.toLowerCase().includes('expir');
                       
  const errorTitle = isExpiredError 
    ? "Lien expiré" 
    : (isNetworkError 
      ? "Problème de connexion" 
      : (error || "Client non trouvé"));

  const errorMessage = isExpiredError
    ? "Ce lien a expiré ou n'est plus valide. Veuillez demander un nouveau QR code."
    : (isNetworkError
      ? "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer."
      : "Impossible d'accéder aux informations du client. Veuillez vérifier le lien ou contacter l'administrateur.");

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow-sm max-w-md w-full border border-red-200 dark:border-red-800">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-destructive">
            {errorTitle}
          </h2>
          <p className="text-muted-foreground mb-4">
            {errorMessage}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="mt-0"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
