
import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorRetryButtonProps {
  onRetry: () => void;
  isLoading: boolean;
  retrying: boolean;
}

export const ErrorRetryButton: React.FC<ErrorRetryButtonProps> = ({
  onRetry,
  isLoading,
  retrying
}) => {
  return (
    <div className="flex justify-center">
      <Button 
        onClick={onRetry} 
        variant="default"
        disabled={isLoading || retrying}
      >
        {isLoading || retrying ? 'Chargement...' : 'Réessayer'}
      </Button>
    </div>
  );
};
