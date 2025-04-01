
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { isOnline, waitForNetwork } from "@/utils/network";

interface RetryButtonProps {
  onRetry: () => void;
  isOnline: boolean;
  retryCount: number;
  setRetryCount: (count: number) => void;
}

export const RetryButton = ({ onRetry, isOnline, retryCount, setRetryCount }: RetryButtonProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryDisabled, setRetryDisabled] = useState(false);
  
  const handleRetry = async () => {
    if (!isRetrying && !retryDisabled) {
      setIsRetrying(true);
      setRetryCount(retryCount + 1);
      setRetryDisabled(true);
      
      console.log("Retrying client fetch...");
      toast.info("Nouvelle tentative", {
        description: "Tentative de reconnexion au serveur..."
      });
      
      // If offline, wait for network before retrying
      if (!isOnline) {
        toast.info("En attente de connexion internet", {
          description: "La tentative sera effectuée dès que possible"
        });
        
        // Wait for network to be restored with a timeout
        const networkRestored = await waitForNetwork(15000);
        if (!networkRestored) {
          toast.error("Toujours hors ligne", {
            description: "Veuillez vérifier votre connexion internet et réessayer."
          });
          setIsRetrying(false);
          
          // Shorter cooldown when offline
          setTimeout(() => {
            setRetryDisabled(false);
          }, 2000);
          
          return;
        }
      }
      
      // Graduated retry delay based on retry count
      const retryDelay = Math.min(retryCount * 800, 2500);
      
      // Tentative de réessai avec délai progressif
      setTimeout(() => {
        onRetry();
        setIsRetrying(false);
        
        // Disable retry button temporarily to prevent spam
        setTimeout(() => {
          setRetryDisabled(false);
        }, retryCount > 2 ? 5000 : 2000); // Longer cooldown after multiple retries
      }, retryDelay); 
    }
  };
  
  return (
    <Button 
      onClick={handleRetry}
      className="w-full gap-2"
      variant="default"
      disabled={isRetrying || retryDisabled}
    >
      <RefreshCcw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
      {isRetrying ? 'Tentative en cours...' : retryDisabled ? 'Patientez...' : 'Réessayer'}
    </Button>
  );
};
