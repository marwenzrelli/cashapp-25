
import React from 'react';

export const PublicClientLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-background p-6 rounded-lg shadow-sm max-w-md w-full border">
        <div className="flex flex-col items-center text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">
            Récupération des informations client en cours
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Cela peut prendre quelques instants. Si le chargement persiste, veuillez actualiser la page.
          </p>
        </div>
      </div>
    </div>
  );
};
