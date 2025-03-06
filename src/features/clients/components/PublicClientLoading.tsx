
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface PublicClientLoadingProps {
  onRetry?: () => void;
  loadingTime?: number; // en secondes
}

export const PublicClientLoading = ({ onRetry, loadingTime = 0 }: PublicClientLoadingProps) => {
  const [dots, setDots] = useState('.');
  const [showRetry, setShowRetry] = useState(false);

  // Animation des points de chargement
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Afficher l'option de réessayer après 10 secondes
  useEffect(() => {
    if (loadingTime >= 10) {
      setShowRetry(true);
    }
  }, [loadingTime]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-background p-6 rounded-lg shadow-sm max-w-md w-full border">
        <div className="flex flex-col items-center text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Chargement{dots}</h2>
          <p className="text-muted-foreground">
            Récupération des informations client en cours
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            {loadingTime > 0 && (
              <span className="block mb-2">
                Temps d'attente: {loadingTime} secondes
              </span>
            )}
            <span className="block">
              Si cette page reste affichée trop longtemps, merci de rafraîchir le navigateur.
            </span>
          </div>
          
          {showRetry && onRetry && (
            <Button 
              onClick={onRetry} 
              className="mt-4 gap-2"
              variant="outline"
            >
              <RefreshCcw className="h-4 w-4" />
              Réessayer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
