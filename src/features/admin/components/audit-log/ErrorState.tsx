
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>{message}</p>
        <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
        </Button>
      </AlertDescription>
    </Alert>
  );
};
