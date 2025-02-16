
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, LogIn, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Tentative de connexion...");

    try {
      // On utilise toujours l'email pour l'authentification Supabase
      const email = login.toLowerCase() === "marwensuperviseur" ? "marwensupervisor@gmail.com" : login;
      console.log("Email utilisé:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Réponse de Supabase:", { data, error });

      if (error) {
        console.error("Erreur de connexion:", error.message);
        toast.error("Identifiants invalides", {
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log("Connexion réussie, utilisateur:", data.user.email);
        toast.success("Connexion réussie", {
          description: "Bienvenue dans votre espace personnel",
        });
        navigate("/dashboard");
      } else {
        console.error("Pas d'utilisateur dans la réponse");
        toast.error("Erreur de connexion", {
          description: "La connexion a échoué, veuillez réessayer",
        });
      }
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast.error("Erreur de connexion", {
        description: "Une erreur inattendue est survenue",
      });
    } finally {
      setIsLoading(false);
      console.log("Fin de la tentative de connexion");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4">
      <div className="w-full max-w-md space-y-8 animate-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Flow Cash Control</h1>
          <p className="text-muted-foreground">
            Connectez-vous pour accéder à votre espace intelligent
          </p>
        </div>

        <Card className="border-muted/50">
          <CardHeader>
            <CardTitle>Connexion sécurisée</CardTitle>
            <CardDescription>
              Authentification avec assistance IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Nom d'utilisateur ou email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login"
                    type="text"
                    placeholder="Entrez votre identifiant"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Se connecter</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
