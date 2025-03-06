
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase, testSupabaseConnection } from "@/integrations/supabase/client";

export type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check connection to Supabase
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      return isConnected;
    } catch (error) {
      console.error("Error checking connection:", error);
      setConnectionStatus('disconnected');
      return false;
    }
  };

  // Handle retry connection
  const handleRetryConnection = async () => {
    await checkConnection();
    setErrorMessage(null);
  };

  // Handle authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Check connection before attempting authentication
    const isConnected = await checkConnection();
    if (!isConnected) {
      setErrorMessage("Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.");
      return;
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
        toast.success("Connexion réussie !");
        navigate("/dashboard");
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

  // Check for active session and setup authentication listeners
  useEffect(() => {
    const getSession = async () => {
      try {
        const isConnected = await checkConnection();
        if (!isConnected) {
          console.log("No connection to Supabase");
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }
        
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
      console.log("Auth state change:", event, session);
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      } else if (event === "SIGNED_OUT" || !session) {
        navigate("/login", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    connectionStatus,
    errorMessage,
    handleAuth,
    handleRetryConnection
  };
};
