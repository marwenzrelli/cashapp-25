
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { makeUserSupervisor } from "@/features/admin/api"; // Updated import path
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showErrorToast } from "@/features/clients/hooks/utils/errorUtils";

const AdminUtility = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const promoteMasterAdmin = async () => {
    setIsLoading(true);
    try {
      console.log("Début de la promotion en superviseur...");
      await makeUserSupervisor("marwen.zrelli.pro@icloud.com");
      console.log("Promotion réussie!");
      toast.success("L'utilisateur a été promu en tant que superviseur", {
        description: "L'utilisateur a maintenant accès à toutes les fonctionnalités d'administration"
      });
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Erreur complète:", error);
      
      // Utiliser showErrorToast pour un affichage cohérent des erreurs
      showErrorToast("Échec de la promotion de l'utilisateur", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <h1 className="text-3xl font-bold">Utilitaire d'administration</h1>
      
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Promouvoir un utilisateur principal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Cliquez sur le bouton ci-dessous pour promouvoir l'utilisateur 
            <strong> marwen.zrelli.pro@icloud.com </strong> 
            en tant que superviseur système.
          </p>
          <Button 
            onClick={promoteMasterAdmin} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Promotion en cours..." : "Promouvoir en superviseur"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUtility;
