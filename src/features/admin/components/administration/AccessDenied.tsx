
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AccessDeniedProps {
  message: string;
}

export const AccessDenied = ({ message }: AccessDeniedProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center max-w-md mx-auto p-6 bg-background rounded-lg shadow-lg border">
        <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Accès non autorisé</h2>
        <p className="text-muted-foreground mb-4">
          {message}
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard")}
          className="mt-4"
        >
          Retourner au tableau de bord
        </Button>
      </div>
    </div>
  );
};
