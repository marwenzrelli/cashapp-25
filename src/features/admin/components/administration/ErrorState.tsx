
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface ErrorStateProps {
  children?: ReactNode;
}

export const ErrorState = ({ children }: ErrorStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center max-w-md mx-auto p-6 bg-background rounded-lg shadow-lg border">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Erreur</h2>
        <p className="text-muted-foreground mb-4">
          Erreur lors du chargement des données
        </p>
        
        {children}
        
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
