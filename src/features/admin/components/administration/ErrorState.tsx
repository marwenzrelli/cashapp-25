
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Lock, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { makeUserSupervisor } from "@/features/admin/api";
import { toast } from "sonner";

interface ErrorStateProps {
  children?: ReactNode;
  errorMessage?: string;
  permissionError?: boolean;
  onRetry?: () => void;
}

export const ErrorState = ({ 
  children, 
  errorMessage, 
  permissionError = false,
  onRetry
}: ErrorStateProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [isMakingSupervisor, setIsMakingSupervisor] = useState(false);
  
  // Check if it's an RLS error or explicitly marked as permission error
  const isRLSError = permissionError || 
    errorMessage?.includes("violates row-level security policy") || 
    errorMessage?.includes("not_admin") || 
    errorMessage?.includes("User not allowed");
  
  const handlePromoteSelf = async () => {
    if (!email) {
      toast.error("Veuillez saisir votre email");
      return;
    }
    
    setIsMakingSupervisor(true);
    try {
      await makeUserSupervisor(email);
      toast.success("Rôle de superviseur attribué avec succès");
      
      // Attendre un peu avant de rediriger
      setTimeout(() => {
        if (onRetry) {
          onRetry();
        } else {
          // Rafraîchir la page pour recharger les permissions
          window.location.reload();
        }
      }, 1500);
      
    } catch (error) {
      console.error("Erreur lors de l'attribution du rôle de superviseur:", error);
      toast.error("Échec de l'attribution du rôle de superviseur", {
        description: error instanceof Error ? error.message : "Une erreur est survenue"
      });
    } finally {
      setIsMakingSupervisor(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center max-w-md mx-auto p-6 bg-background rounded-lg shadow-lg border">
        {isRLSError ? <Lock className="w-12 h-12 text-destructive mx-auto mb-4" /> : <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />}
        <h2 className="text-2xl font-semibold mb-2">{isRLSError ? "Accès refusé" : "Erreur"}</h2>
        <p className="text-muted-foreground mb-4">
          {isRLSError 
            ? "Vous n'avez pas les permissions nécessaires pour cette action." 
            : (errorMessage || "Erreur lors du chargement des données")}
        </p>
        
        {children || (
          <div className="space-y-4">
            {isRLSError && (
              <p className="text-sm text-muted-foreground">
                Cette fonctionnalité est réservée aux administrateurs de la plateforme.
              </p>
            )}
            
            {!showPromotionForm ? (
              <div className="flex flex-wrap gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                  className="mt-2"
                >
                  Retourner au tableau de bord
                </Button>
                {isRLSError && (
                  <>
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowPromotionForm(true)}
                      className="mt-2"
                    >
                      Demander un accès superviseur
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/admin-utility")}
                      className="mt-2"
                    >
                      Accéder à l'utilitaire d'administration
                    </Button>
                    {onRetry && (
                      <Button 
                        onClick={onRetry}
                        variant="default"
                        className="mt-2 flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Vérifier les permissions
                      </Button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                      <Shield className="h-5 w-5" />
                      <h3 className="font-medium">Demande d'accès superviseur</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Votre email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Entrez votre email pour obtenir le rôle superviseur"
                      />
                      <p className="text-xs text-muted-foreground">
                        Entrez l'email associé à votre compte utilisateur actuel
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={handlePromoteSelf}
                        disabled={!email || isMakingSupervisor}
                        className="flex items-center gap-2"
                      >
                        {isMakingSupervisor ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Attribution en cours...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" />
                            Obtenir le rôle superviseur
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPromotionForm(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Après avoir obtenu le rôle superviseur, la page sera rechargée automatiquement.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
