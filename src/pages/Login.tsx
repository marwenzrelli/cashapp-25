
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEmail = identifier.includes('@');
      let email = identifier;

      if (!isEmail) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', identifier);

        if (profilesError) {
          throw new Error("Erreur lors de la recherche de l'utilisateur");
        }

        if (!profiles || profiles.length === 0) {
          toast({
            title: "Erreur",
            description: "Nom d'utilisateur introuvable",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        email = profiles[0].email;
      }

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Gestion spécifique de l'erreur "email non confirmé"
        if (signInError.message === "Email not confirmed") {
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email,
          });

          if (resendError) {
            toast({
              title: "Erreur",
              description: "Impossible de renvoyer l'email de confirmation",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Email non confirmé",
              description: "Un nouvel email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception.",
            });
          }
          return;
        }

        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la connexion",
          variant: "destructive",
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', authData.user.id)
        .single();

      if (profileError || profile?.status === 'inactive') {
        await supabase.auth.signOut();
        toast({
          title: "Compte inactif",
          description: "Votre compte a été désactivé. Veuillez contacter l'administrateur.",
          variant: "destructive",
        });
        return;
      }

      navigate("/dashboard");
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

  const createSupervisor = async () => {
    try {
      setIsLoading(true);

      const supervisorEmail = "supervisor@flowcash.com";
      const username = "superviseur2024";

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', supervisorEmail)
        .maybeSingle();

      if (existingUser) {
        toast({
          title: "Information",
          description: `Le compte existe déjà. Si vous n'avez pas reçu l'email de confirmation, essayez de vous connecter pour le renvoyer.`,
        });
        return;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: supervisorEmail,
        password: '12345678',
        options: {
          data: {
            full_name: 'Marwen Superviseur',
            role: 'supervisor',
            department: 'finance',
            username: username
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      if (signUpError) {
        if (signUpError.message === "Signups not allowed for this instance") {
          toast({
            title: "Configuration requise",
            description: "L'inscription est désactivée dans Supabase. Veuillez l'activer dans les paramètres.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: signUpError.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (!authData.user) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la création du compte",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Compte créé",
        description: "Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception.",
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
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

        <p className="text-sm text-gray-500 text-center">
          Si vous n'avez pas reçu l'email de confirmation, essayez de vous connecter pour le renvoyer
        </p>

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
