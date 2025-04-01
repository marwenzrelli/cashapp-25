
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface RetryButtonProps {
  onRetry: () => void;
  isOnline: boolean;
  retryCount: number;
  setRetryCount: (count: number) => void;
}

export const RetryButton = ({ onRetry, isOnline, retryCount, setRetryCount }: RetryButtonProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryDisabled, setRetryDisabled] = useState(false);
  
  const handleRetry = () => {
    if (!isRetrying && !retryDisabled) {
      setIsRetrying(true);
      setRetryCount(retryCount + 1);
      setRetryDisabled(true);
      
      console.log("Retrying client fetch...");
      toast.info("Nouvelle tentative", {
        description: "Tentative de reconnexion au serveur..."
      });
      
      // Tentative de réessai avec délai progressif
      setTimeout(() => {
        onRetry();
        setIsRetrying(false);
        
        // Disable retry button temporarily to prevent spam
        setTimeout(() => {
          setRetryDisabled(false);
        }, retryCount > 2 ? 5000 : 2000); // Longer cooldown after multiple retries
      }, retryCount * 800); // Increased delay between retries
    }
  };
  
  return (
    <Button 
      onClick={handleRetry}
      className="w-full gap-2"
      variant="default"
      disabled={!isOnline || isRetrying || retryDisabled}
    >
      <RefreshCcw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
      {isRetrying ? 'Tentative en cours...' : retryDisabled ? 'Patientez...' : 'Réessayer'}
    </Button>
  );
};
