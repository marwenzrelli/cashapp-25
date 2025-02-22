
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
  const [hasSupervisor, setHasSupervisor] = useState(false);
  const navigate = useNavigate();

  const checkSupervisor = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'supervisor');

      if (error) throw error;
      const supervisorExists = count > 0;
      setHasSupervisor(supervisorExists);
      if (supervisorExists) {
        setIsSignUp(false); // Force le mode connexion si un superviseur existe
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du superviseur:", error);
    }
  };

  useEffect(() => {
    // Vérifier la session active
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Session check:", { session, error: sessionError });
        if (session?.user?.id) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
      }
    };
    getSession();

    // Vérifier l'existence d'un superviseur
    checkSupervisor();

    // Mettre en place une souscription aux changements de la table profiles
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          // Revérifier l'existence d'un superviseur à chaque changement
          checkSupervisor();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      profilesSubscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("Tentative d'authentification avec:", { email: normalizedEmail, isSignUp });
      
      if (isSignUp && !hasSupervisor) { // Vérification supplémentaire
        if (!fullName) {
          toast.error("Le nom complet est requis pour l'inscription");
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'supervisor'
            },
            emailRedirectTo: window.location.origin
          }
        });

        console.log("Réponse inscription:", { data, error });

        if (error) {
          console.error("Erreur détaillée d'inscription:", error);
          let errorMessage = "Erreur lors de l'inscription";
          if (error.message.includes("already registered")) {
            errorMessage = "Cet email est déjà utilisé";
          }
          toast.error(errorMessage);
          return;
        }

        if (data.user) {
          toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
          setIsSignUp(false);
          await checkSupervisor(); // Vérifier immédiatement après la création
        }
      } else {
        console.log("Début de la procédure de connexion");
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        console.log("Réponse connexion:", { data, error });

        if (error) {
          console.error("Erreur détaillée de connexion:", error);
          let errorMessage = "Erreur de connexion";
          if (error.message.includes("Invalid login credentials")) {
            errorMessage = "Email ou mot de passe incorrect";
          } else if (error.message.includes("Email not confirmed")) {
            errorMessage = "Veuillez confirmer votre email avant de vous connecter";
          }
          toast.error(errorMessage);
          return;
        }

        if (data?.user) {
          console.log("Connexion réussie, redirection...");
          navigate("/dashboard");
          toast.success("Connexion réussie !");
        }
      }
    } catch (error: any) {
      console.error("Erreur détaillée d'authentification:", error);
      toast.error("Une erreur inattendue est survenue");
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
          {isSignUp && !hasSupervisor && (
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
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Chargement..." : (isSignUp && !hasSupervisor ? "Créer un compte" : "Se connecter")}
          </Button>
          {!hasSupervisor && (
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
          )}
        </form>
      </Card>
    </div>
  );
};

export default Login;
