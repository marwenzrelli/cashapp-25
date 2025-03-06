
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConnectionStatus } from "@/hooks/useAuth";

interface ErrorAlertProps {
  errorMessage: string | null;
  connectionStatus: ConnectionStatus;
  onRetryConnection: () => Promise<void>;
}

export const ErrorAlert = ({ 
  errorMessage, 
  connectionStatus, 
  onRetryConnection 
}: ErrorAlertProps) => {
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
