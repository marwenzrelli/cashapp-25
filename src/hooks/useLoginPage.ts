
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase, testSupabaseConnection } from "@/integrations/supabase/client";
import { ConnectionStatus } from "@/components/login/types";

export const useLoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check connection to Supabase with a maximum timeout
  const checkConnection = useCallback(async () => {
    setConnectionStatus('checking');
    try {
      // Use Promise.race to limit the wait time
      const connectionPromise = testSupabaseConnection();
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("La connexion a expiré")), 10000);
      });
      
      const isConnected = await Promise.race([connectionPromise, timeoutPromise]);
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setConnectionStatus('disconnected');
    }
  }, []);

  // Handle retry connection request
  const handleRetryConnection = () => {
    checkConnection();
    setErrorMessage(null);
  };

  // Handle authentication
  const handleAuth = async (email: string, password: string) => {
    setErrorMessage(null);
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Verify the browser is online
    if (!navigator.onLine) {
      setErrorMessage("Vous êtes hors ligne. Veuillez vérifier votre connexion internet.");
      setConnectionStatus('disconnected');
      return;
    }

    // Check connection before attempting authentication
    if (connectionStatus !== 'connected') {
      try {
        const isConnected = await testSupabaseConnection();
        if (!isConnected) {
          setErrorMessage("Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.");
          return;
        }
      } catch (error) {
        setErrorMessage("Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("Début de la procédure de connexion");
      
      // Use Promise.race to add a timeout
      const loginPromise = supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("La connexion a expiré")), 15000);
      });
      
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      console.log("Réponse connexion:", { data, error });

      if (error) {
        console.error("Erreur détaillée de connexion:", error);
        let errorMessage = "Erreur de connexion";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou mot de passe incorrect";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Veuillez confirmer votre email avant de vous connecter";
        } else if (error.message.includes("Failed to fetch") || 
                  error.message.includes("NetworkError") || 
                  error.message.includes("expiré") || 
                  error.status === 0) {
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
      let errorMsg = error.message || "Une erreur inattendue est survenue";
      
      // Handle network errors specifically
      if (error.message?.includes("Failed to fetch") || 
          error.message?.includes("NetworkError") || 
          error.message?.includes("expiré") || 
          error.toString().includes("network") ||
          !navigator.onLine) {
        errorMsg = "Problème de connexion réseau. Veuillez vérifier votre connexion internet.";
        setConnectionStatus('disconnected');
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check active session and connection
    const getSession = async () => {
      try {
        setConnectionStatus('checking');
        
        // Check if the browser is online
        if (!navigator.onLine) {
          setConnectionStatus('disconnected');
          setErrorMessage("Vous êtes hors ligne. Veuillez vérifier votre connexion internet.");
          return;
        }
        
        await checkConnection();

        // Use Promise.race to add a timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("La requête de session a expiré")), 10000);
        });
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        console.log("Session check:", { session });
        if (session?.user?.id) {
          navigate("/dashboard");
        }
      } catch (error: any) {
        console.error("Erreur lors de la vérification de la session:", error);
        
        // Handle network errors specifically
        if (error.message?.includes("Failed to fetch") || 
            error.message?.includes("NetworkError") ||
            error.message?.includes("expiré") ||
            !navigator.onLine) {
          setErrorMessage("Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
        } else {
          setErrorMessage("Erreur lors de la vérification de la session: " + error.message);
        }
        
        setConnectionStatus('disconnected');
      }
    };
    getSession();

    // Network event handlers
    const handleOnline = () => {
      toast.success("Connexion internet rétablie");
      checkConnection();
      setErrorMessage(null);
    };
    
    const handleOffline = () => {
      setConnectionStatus('disconnected');
      setErrorMessage("Vous êtes hors ligne. Veuillez vérifier votre connexion internet.");
      toast.error("Vous êtes hors ligne. Veuillez vérifier votre connexion internet.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/login", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate, checkConnection]);

  return {
    isLoading,
    connectionStatus,
    errorMessage,
    handleRetryConnection,
    handleAuth
  };
};
