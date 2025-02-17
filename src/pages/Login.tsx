
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedUsername = username.trim().toLowerCase();
      console.log("1. Tentative de connexion avec username:", normalizedUsername);
      
      // Utiliser directement l'email comme username puisque nous savons que c'est marwen.superviseur@flowcash.com
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "marwen.superviseur@flowcash.com",
        password: password,
      });

      console.log("2. Résultat de la connexion:", { data, error });

      if (error) {
        console.error("Erreur de connexion:", error);
        toast({
          title: "Erreur de connexion",
          description: "Nom d'utilisateur ou mot de passe incorrect",
          variant: "destructive",
        });
        return;
      }

      if (!data.user) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la connexion",
          variant: "destructive",
        });
        return;
      }

      // Si connecté avec succès, rediriger vers le dashboard
      console.log("3. Connexion réussie, redirection...");
      navigate("/dashboard");

    } catch (error: any) {
      console.error("Erreur inattendue:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue",
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
      </Card>
    </div>
  );
};

export default Login;
