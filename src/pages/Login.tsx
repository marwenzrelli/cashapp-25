
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase, testSupabaseConnection } from "@/integrations/supabase/client";
import { DollarSign, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Vérifier la connexion à Supabase
  const checkConnection = async () => {
    setConnectionStatus('checking');
    const isConnected = await testSupabaseConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  };

  useEffect(() => {
    // Vérifier la session active et la connexion
    const getSession = async () => {
      try {
        setConnectionStatus('checking');
        await checkConnection();

        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session check:", { session });
        if (session?.user?.id) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        setConnectionStatus('disconnected');
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/login", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleRetryConnection = () => {
    checkConnection();
    setErrorMessage(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Vérifier la connexion avant de tenter l'authentification
    if (connectionStatus !== 'connected') {
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        setErrorMessage("Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
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
        } else if (error.message.includes("Failed to fetch") || error.status === 0) {
          errorMessage = "Problème de connexion réseau. Veuillez vérifier votre connexion internet.";
          setConnectionStatus('disconnected');
        }
        
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (data?.user) {
        console.log("Connexion réussie, redirection...");
        navigate("/dashboard");
        toast.success("Connexion réussie !");
      }
    } catch (error: any) {
      console.error("Erreur détaillée d'authentification:", error);
      const errorMsg = error.message || "Une erreur inattendue est survenue";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      
      if (error.message?.includes("Failed to fetch") || error.toString().includes("network")) {
        setConnectionStatus('disconnected');
      }
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
          <h1 className="text-2xl font-bold">FinanceFlow Pro</h1>
          <p className="text-gray-500">Connectez-vous à votre compte</p>
          
          {connectionStatus === 'connected' && (
            <div className="flex items-center justify-center gap-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-xs">Connecté au serveur</span>
            </div>
          )}
          
          {connectionStatus === 'disconnected' && (
            <div className="flex items-center justify-center gap-1 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs">Déconnecté du serveur</span>
            </div>
          )}
          
          {connectionStatus === 'checking' && (
            <div className="flex items-center justify-center gap-1 text-amber-600">
              <span className="text-xs animate-pulse">Vérification de la connexion...</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
            {connectionStatus === 'disconnected' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full" 
                onClick={handleRetryConnection}
              >
                Réessayer la connexion
              </Button>
            )}
          </Alert>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={connectionStatus === 'checking' || isLoading}
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
              disabled={connectionStatus === 'checking' || isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || connectionStatus === 'checking' || connectionStatus === 'disconnected'}
          >
            {isLoading ? "Chargement..." : "Se connecter"}
          </Button>
          
          {connectionStatus === 'disconnected' && (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-2"
              onClick={handleRetryConnection}
            >
              Vérifier la connexion
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
};

export default Login;
