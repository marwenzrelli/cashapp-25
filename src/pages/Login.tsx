
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fonction temporaire pour créer le compte superviseur
  const createSupervisor = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: 'marwenzrelli.pro@icloud.com',
        password: '12345678',
        options: {
          data: {
            full_name: 'Marwen Superviseur',
            role: 'supervisor',
            department: 'finance',
            username: 'marwensuperviseur'
          }
        }
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Compte superviseur créé avec succès",
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Pour la connexion
      const isEmail = identifier.includes('@');
      let email = identifier;

      if (!isEmail) {
        // Recherche par nom d'utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, status')
          .eq('username', identifier)
          .maybeSingle();

        if (profileError) {
          throw new Error("Erreur lors de la recherche de l'utilisateur");
        }

        if (!profile) {
          toast({
            title: "Erreur",
            description: "Nom d'utilisateur introuvable",
            variant: "destructive",
          });
          return;
        }

        if (profile.status === 'inactive') {
          toast({
            title: "Compte inactif",
            description: "Votre compte a été désactivé. Veuillez contacter l'administrateur.",
            variant: "destructive",
          });
          return;
        }

        email = profile.email;
      }

      // Tentative de connexion
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        });
        return;
      }

      // Si la connexion réussit, vérifier le statut du profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', data.user.id)
        .single();

      if (profile?.status === 'inactive') {
        await supabase.auth.signOut();
        toast({
          title: "Compte inactif",
          description: "Votre compte a été désactivé. Veuillez contacter l'administrateur.",
          variant: "destructive",
        });
        return;
      }

      // Tout est bon, rediriger vers le dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erreur d'authentification:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] rounded-lg blur opacity-50"></div>
              <div className="relative bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] p-3 rounded-lg">
                <DollarSign className="h-8 w-8 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Flow Cash Control</h1>
          <p className="text-gray-500">
            Connectez-vous à votre compte
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Email ou nom d'utilisateur"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Chargement..." : "Se connecter"}
          </Button>
        </form>

        {/* Bouton temporaire pour créer le compte superviseur - À SUPPRIMER APRÈS UTILISATION */}
        <Button
          type="button"
          variant="outline"
          onClick={createSupervisor}
          disabled={isLoading}
          className="w-full mt-4"
        >
          Créer le compte superviseur
        </Button>
      </Card>
    </div>
  );
};

export default Login;
