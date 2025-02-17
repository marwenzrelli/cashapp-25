
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState(""); // Pour l'email ou le nom d'utilisateur
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Pour l'inscription, on utilise toujours l'email
        const { error } = await supabase.auth.signUp({
          email: identifier,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (error) throw error;

        toast({
          title: "Inscription réussie !",
          description: "Veuillez vérifier votre email pour confirmer votre compte.",
        });
      } else {
        // Pour la connexion, vérifier si l'identifiant est un email
        const isEmail = identifier.includes('@');
        
        let email = identifier;
        if (!isEmail) {
          // Si ce n'est pas un email, chercher l'utilisateur par son nom d'utilisateur
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', identifier)
            .maybeSingle();

          if (error || !profile) {
            toast({
              title: "Erreur",
              description: "Nom d'utilisateur ou mot de passe incorrect",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          email = profile.email;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        navigate("/dashboard");
      }
    } catch (error: any) {
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
            {isSignUp ? "Créez votre compte" : "Connectez-vous à votre compte"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder={isSignUp ? "Email" : "Email ou nom d'utilisateur"}
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
            {isLoading
              ? "Chargement..."
              : isSignUp
              ? "S'inscrire"
              : "Se connecter"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp
              ? "Déjà un compte ? Connectez-vous"
              : "Pas de compte ? Inscrivez-vous"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
