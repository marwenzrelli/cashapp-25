
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "./types";

interface LoginErrorProps {
  errorMessage: string | null;
  connectionStatus: ConnectionStatus;
  onRetryConnection: () => void;
}

export const LoginError = ({ 
  errorMessage, 
  connectionStatus, 
  onRetryConnection 
}: LoginErrorProps) => {
  if (!errorMessage) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erreur</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
      {connectionStatus === 'disconnected' && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full" 
          onClick={onRetryConnection}
        >
          Réessayer la connexion
        </Button>
      )}
    </Alert>
  );
};
