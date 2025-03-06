
import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PublicClientErrorProps {
  error: string | null;
}

export const PublicClientError = ({ error }: PublicClientErrorProps) => {
  // Determine if the error is related to security or invalid access
  const isSecurityError = error?.toLowerCase().includes('invalide') || 
                          error?.toLowerCase().includes('expiré') ||
                          error?.toLowerCase().includes('désactivé') ||
                          error?.toLowerCase().includes('suspendu') ||
                          error?.toLowerCase().includes('token');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-background p-6 rounded-lg shadow-sm max-w-md w-full border">
        <div className="flex flex-col items-center text-center">
          <div className={`${isSecurityError ? 'bg-amber-100' : 'bg-red-100'} p-3 rounded-full mb-4`}>
            {isSecurityError ? (
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          
          <h2 className="text-xl font-semibold mb-2">
            {isSecurityError ? "Accès refusé" : "Erreur d'accès"}
          </h2>
          
          <p className="text-muted-foreground mb-4">
            {error || "Impossible d'accéder au profil client demandé"}
          </p>
          
          <p className="text-sm text-muted-foreground mb-6">
            {isSecurityError 
              ? "Le lien utilisé pourrait être expiré, invalide ou l'accès a été révoqué."
              : "Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard."}
          </p>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Réessayer
          </Button>
        </div>
      </div>
    </div>
  );
};
