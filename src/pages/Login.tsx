
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Wifi, WifiOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Check online status
  const checkOnlineStatus = () => {
    const online = navigator.onLine;
    setIsOffline(!online);
    return online;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check network connection first
    if (!checkOnlineStatus()) {
      toast.error("Erreur de connexion", {
        description: "Vous êtes actuellement hors ligne. Vérifiez votre connexion internet."
      });
      setIsLoading(false);
      return;
    }

    try {
      // Set timeout for login request
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      clearTimeout(timeoutId);

      if (error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("network")) {
          throw new Error("Problème de connexion au serveur. Vérifiez votre connexion internet ou réessayez plus tard.");
        }
        throw error;
      }

      toast.success("Connexion réussie");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      
      // Personnaliser les messages d'erreur
      let errorMessage = "Veuillez vérifier vos identifiants";
      
      if (error.message?.includes("Invalid login") || error.message?.includes("Invalid email")) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.message?.includes("network") || error.message?.includes("Failed to fetch")) {
        errorMessage = "Problème de connexion au serveur. Vérifiez votre connexion internet ou réessayez plus tard.";
        checkOnlineStatus(); // Refresh offline status
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Veuillez confirmer votre adresse email avant de vous connecter";
      }
      
      toast.error("Échec de la connexion", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        {isOffline && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <WifiOff className="h-5 w-5 mr-2" />
            <p className="text-sm">Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent ne pas être disponibles.</p>
          </div>
        )}

        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Connexion
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour accéder au système
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Besoin de créer un compte superviseur?{" "}
            <Link to="/create-supervisor" className="font-medium text-blue-600 hover:text-blue-500">
              Créer un compte
            </Link>
          </p>
        </div>

        {/* Statut de connexion */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
          <div className="flex items-center text-sm text-gray-500">
            {isOffline ? (
              <>
                <WifiOff className="h-4 w-4 mr-1 text-red-500" />
                Hors ligne
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-1 text-green-500" />
                En ligne
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
