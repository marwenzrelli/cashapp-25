
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { makeUserSupervisor } from "@/features/admin/api"; 
import { createSupervisorAccount } from "@/features/admin/api";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showErrorToast } from "@/features/clients/hooks/utils/errorUtils";
import { supabase } from "@/integrations/supabase/client";

const AdminUtility = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email] = useState("marwen.zrelli.pro@icloud.com");
  
  const checkUserExists = async (email: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
    
    if (error) {
      console.error("Erreur lors de la vérification de l'utilisateur:", error);
      throw error;
    }
    
    return !!data;
  };
  
  const createUser = async () => {
    try {
      console.log("Création d'un nouvel utilisateur avant promotion...");
      
      // Génération d'un mot de passe fort et aléatoire
      const temporaryPassword = "Temp" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10) + "!";
      
      const result = await createSupervisorAccount({
        email: email,
        password: temporaryPassword,
        fullName: "Superviseur Principal",
        username: "supervisor_" + Math.random().toString(36).substring(2, 7)
      });
      
      console.log("Résultat de la création:", result);
      
      if (result) {
        console.log("Utilisateur créé avec succès avant promotion");
        toast.success("Nouvel utilisateur créé", {
          description: "Un utilisateur temporaire a été créé et sera promu en superviseur"
        });
        return true;
      } else {
        throw new Error("Échec de la création de l'utilisateur");
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  };
  
  const promoteMasterAdmin = async () => {
    setIsLoading(true);
    try {
      console.log("Début de la promotion en superviseur...");
      
      // Vérifier si l'utilisateur existe
      const userExists = await checkUserExists(email);
      
      if (!userExists) {
        console.log(`L'utilisateur ${email} n'existe pas. Création en cours...`);
        await createUser();
        
        // Petit délai pour s'assurer que l'utilisateur est bien créé dans la base de données
        console.log("Attente pour s'assurer que l'utilisateur est bien créé...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Vérifier à nouveau si l'utilisateur a bien été créé
        const userCreated = await checkUserExists(email);
        if (!userCreated) {
          throw new Error("L'utilisateur n'a pas pu être créé correctement");
        }
        console.log("Utilisateur vérifié comme créé avec succès");
      } else {
        console.log(`L'utilisateur ${email} existe déjà`);
      }
      
      // Promouvoir l'utilisateur en superviseur
      console.log("Promotion de l'utilisateur en superviseur...");
      await makeUserSupervisor(email);
      console.log("Promotion réussie!");
      
      toast.success("L'utilisateur a été promu en tant que superviseur", {
        description: "L'utilisateur a maintenant accès à toutes les fonctionnalités d'administration"
      });
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Erreur complète:", error);
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
            <strong> {email} </strong> 
            en tant que superviseur système.
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Si l'utilisateur n'existe pas encore, il sera automatiquement créé avec un mot de passe temporaire.
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
