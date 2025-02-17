
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Vérifier l'état de la session au chargement
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Session actuelle:", session, "Erreur:", error);
      if (session) {
        console.log("Utilisateur déjà connecté, redirection...");
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("1. Tentative de connexion avec email:", normalizedEmail);
      
      // Test de connexion avec la session actuelle
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Session avant connexion:", currentSession);

      // Tentative de connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      console.log("2. Résultat complet de la connexion:", {
        data,
        error,
        session: data?.session,
        user: data?.user
      });

      if (error) {
        console.error("Erreur détaillée de connexion:", {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });
        toast({
          title: "Erreur de connexion",
          description: `${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (!data.user || !data.session) {
        console.error("Données de connexion incomplètes:", { data });
        toast({
          title: "Erreur",
          description: "Données de connexion incomplètes",
          variant: "destructive",
        });
        return;
      }

      // Vérification de la session après connexion
      const { data: { session: newSession } } = await supabase.auth.getSession();
      console.log("3. Session après connexion réussie:", newSession);
      
      console.log("4. Connexion réussie, redirection...");
      navigate("/dashboard");

    } catch (error: any) {
      console.error("Erreur technique détaillée:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Erreur technique",
        description: error.message || "Une erreur inattendue est survenue",
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
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
