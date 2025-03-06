
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PublicClientErrorProps {
  error: string | null;
}

export const PublicClientError = ({ error }: PublicClientErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-background p-6 rounded-lg shadow-sm max-w-md w-full border">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Erreur d'accès</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Impossible d'accéder au profil client demandé"}
          </p>
          <p className="text-sm text-muted-foreground">
            Le lien utilisé pourrait être expiré, invalide ou le profil n'existe plus.
          </p>
        </div>
      </div>
    </div>
  );
};
