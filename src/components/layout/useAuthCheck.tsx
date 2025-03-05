
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserRole } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthCheck = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    const checkSessionAndRole = async () => {
      try {
        setIsCheckingAuth(true);
        setNetworkError(false);
        
        // Check network connectivity first
        const isOnline = navigator.onLine;
        if (!isOnline) {
          console.log("L'appareil est hors ligne");
          setNetworkError(true);
          toast.error("Vous êtes actuellement hors ligne. Veuillez vérifier votre connexion internet.");
          setIsCheckingAuth(false);
          return;
        }
        
        // Get session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("La requête a expiré")), 10000);
        });
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (sessionError) {
          console.error("Erreur lors de la récupération de la session:", sessionError);
          
          if (sessionError.message?.includes("Failed to fetch") || 
              sessionError.message?.includes("NetworkError") ||
              sessionError.message?.includes("network") ||
              sessionError.message?.includes("expiré")) {
            setNetworkError(true);
            toast.error("Erreur de connexion: Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
          } else {
            toast.error("Erreur d'authentification: " + sessionError.message);
          }
          
          navigate("/login", { replace: true });
          return;
        }
        
        if (!session) {
          console.log("Aucune session active, redirection vers la page de connexion");
          navigate("/login", { replace: true });
          return;
        }

        // Get user profile with timeout
        const profilePromise = supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        const { data: profile, error: profileError } = await Promise.race([
          profilePromise,
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("La requête de profil a expiré")), 10000);
          })
        ]) as any;

        if (profileError) {
          console.error("Erreur lors de la récupération du profil:", profileError);
          
          if (profileError.message?.includes("Failed to fetch") || 
              profileError.message?.includes("NetworkError") ||
              profileError.message?.includes("network") ||
              profileError.message?.includes("expiré")) {
            setNetworkError(true);
            toast.error("Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
          } else if (profileError.code === 'PGRST116') {
            toast.error("Profil utilisateur non trouvé. Veuillez contacter un administrateur.");
          } else {
            toast.error("Erreur lors de la vérification des permissions: " + profileError.message);
          }
          
          // Only redirect for auth errors, not network errors
          if (!profileError.message?.includes("Failed to fetch") && 
              !profileError.message?.includes("NetworkError") &&
              !profileError.message?.includes("network") &&
              !profileError.message?.includes("expiré")) {
            navigate("/login", { replace: true });
          }
          
          return;
        }

        setUserRole(profile.role);
        
        const restrictedRoutes = {
          '/administration': ['supervisor'],
          '/statistics': ['supervisor', 'manager']
        };

        const currentPath = location.pathname;
        const allowedRoles = restrictedRoutes[currentPath as keyof typeof restrictedRoutes];

        if (allowedRoles && !allowedRoles.includes(profile.role)) {
          toast.error("Accès non autorisé pour votre rôle: " + profile.role);
          navigate("/dashboard", { replace: true });
        }
      } catch (error: any) {
        console.error("Erreur inattendue lors de la vérification de l'authentification:", error);
        
        if (error.message?.includes("Failed to fetch") || 
            error.message?.includes("NetworkError") || 
            error.message?.includes("network") ||
            error.message?.includes("expiré") ||
            !navigator.onLine) {
          setNetworkError(true);
          toast.error("Erreur de connexion: Problème de connexion réseau. Veuillez vérifier votre connexion internet.");
        } else {
          toast.error("Une erreur est survenue: " + (error.message || "Vérifiez votre connexion internet"));
          navigate("/login", { replace: true });
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkSessionAndRole();

    // Network status event listeners
    const handleOnline = () => {
      if (networkError) {
        toast.success("Connexion internet rétablie");
        setNetworkError(false);
        checkSessionAndRole();
      }
    };
    
    const handleOffline = () => {
      setNetworkError(true);
      toast.error("Vous êtes hors ligne. Certaines fonctionnalités peuvent ne pas être disponibles.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/login", { replace: true });
      } else if (event === "SIGNED_IN") {
        checkSessionAndRole();
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate, location.pathname, networkError]);

  return { userRole, isCheckingAuth, networkError };
};
