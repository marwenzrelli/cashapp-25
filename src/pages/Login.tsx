
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  // Vérifier l'état de la session au chargement
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      if (isSignUp) {
        // Inscription d'un nouveau compte
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'supervisor',
              username: normalizedEmail.split('@')[0]
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Stocker le mot de passe dans la table profiles
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              hashed_password: password
            })
            .eq('id', data.user.id);

          if (updateError) {
            console.error("Erreur lors de la mise à jour du profil:", updateError);
          }

          toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
          setIsSignUp(false);
        }
      } else {
        // Tentative de connexion directe avec Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          console.error("Erreur de connexion:", error);
          toast.error("Email ou mot de passe incorrect");
          return;
        }

        if (data.user) {
          // Vérifier le statut du compte
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error("Erreur lors de la vérification du profil:", profileError);
            toast.error("Erreur lors de la vérification du compte");
            return;
          }

          if (profileData.status === 'inactive') {
            // Déconnexion si le compte est inactif
            await supabase.auth.signOut();
            toast.error("Votre compte est désactivé. Contactez un administrateur.");
            return;
          }

          toast.success("Connexion réussie !");
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Erreur d'authentification:", error);
      
      // Messages d'erreur personnalisés
      let errorMessage = "Une erreur est survenue";
      if (error.message.includes("Email not confirmed")) {
        errorMessage = "Veuillez confirmer votre email avant de vous connecter";
      } else if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.message.includes("User already registered")) {
        errorMessage = "Un compte existe déjà avec cet email";
      }
      
      toast.error(errorMessage);
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
            {isSignUp ? "Créer un nouveau compte" : "Connectez-vous à votre compte"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
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
            {isLoading ? "Chargement..." : (isSignUp ? "Créer un compte" : "Se connecter")}
          </Button>
          <p className="text-center text-sm text-gray-500">
            {isSignUp ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Se connecter" : "Créer un compte"}
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Login;
