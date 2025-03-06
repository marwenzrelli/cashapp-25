
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface ErrorStateProps {
  children?: ReactNode;
  errorMessage?: string;
}

export const ErrorState = ({ children, errorMessage }: ErrorStateProps) => {
  const navigate = useNavigate();
  
  const isRLSError = errorMessage?.includes("violates row-level security policy");
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center max-w-md mx-auto p-6 bg-background rounded-lg shadow-lg border">
        {isRLSError ? <Shield className="w-12 h-12 text-destructive mx-auto mb-4" /> : <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />}
        <h2 className="text-2xl font-semibold mb-2">Erreur</h2>
        <p className="text-muted-foreground mb-4">
          {isRLSError 
            ? "Vous n'avez pas les permissions nécessaires pour cette action" 
            : "Erreur lors du chargement des données"}
        </p>
        
        {children}
        
        {!children && (
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="mt-4"
          >
            Retourner au tableau de bord
          </Button>
        )}
      </div>
    </div>
  );
};
