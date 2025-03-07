
import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Chargement en cours..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  );
};
