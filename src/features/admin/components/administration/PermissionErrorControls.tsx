
import { Button } from "@/components/ui/button";
import { RefreshCw, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PermissionErrorControlsProps {
  isRetrying: boolean;
  onRetry: () => void;
  onShowPromotionForm: () => void;
}

export const PermissionErrorControls = ({
  isRetrying,
  onRetry,
  onShowPromotionForm
}: PermissionErrorControlsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
      <Button 
        onClick={() => navigate("/dashboard")} 
        variant="default"
        className="flex items-center gap-2"
      >
        Retourner au tableau de bord
      </Button>
      <Button
        onClick={onRetry}
        variant="outline"
        className="flex items-center gap-2"
        disabled={isRetrying}
      >
        <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Vérification...' : 'Vérifier les permissions'}
      </Button>
      <Button
        onClick={onShowPromotionForm}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <Shield className="h-4 w-4" />
        Obtenir les droits d'accès
      </Button>
    </div>
  );
};
