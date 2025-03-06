
import React from 'react';
import { AlertCircle, ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PublicClientErrorProps {
  error: string | null;
}

export const PublicClientError = ({ error }: PublicClientErrorProps) => {
  const navigate = useNavigate();
  
  // Determine if the error is related to security or invalid access
  const isSecurityError = error?.toLowerCase().includes('invalide') || 
                          error?.toLowerCase().includes('expiré') ||
                          error?.toLowerCase().includes('désactivé') ||
                          error?.toLowerCase().includes('suspendu') ||
                          error?.toLowerCase().includes('token');

  const isClientMissing = error?.toLowerCase().includes('introuvable') ||
                          error?.toLowerCase().includes('not found') ||
                          error?.toLowerCase().includes('manquant');
                          
  // Handle retry button click
  const handleRetry = () => {
    window.location.reload();
  };
  
  // Handle go to home button click
  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-background p-6 rounded-lg shadow-sm max-w-md w-full border">
        <div className="flex flex-col items-center text-center">
          <div className={`${isSecurityError ? 'bg-amber-100' : isClientMissing ? 'bg-blue-100' : 'bg-red-100'} p-3 rounded-full mb-4`}>
            {isSecurityError ? (
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            ) : isClientMissing ? (
              <AlertCircle className="h-8 w-8 text-blue-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          
          <h2 className="text-xl font-semibold mb-2">
            {isSecurityError ? "Accès refusé" : isClientMissing ? "Client introuvable" : "Erreur d'accès"}
          </h2>
          
          <p className="text-muted-foreground mb-4">
            {error || "Impossible d'accéder au profil client demandé"}
          </p>
          
          <p className="text-sm text-muted-foreground mb-6">
            {isSecurityError 
              ? "Le lien utilisé pourrait être expiré, invalide ou l'accès a été révoqué."
              : isClientMissing
              ? "Le client demandé n'existe pas ou a été supprimé."
              : "Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard."}
          </p>

          <div className="flex flex-col w-full gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRetry}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoToHome}
              className="w-full"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
