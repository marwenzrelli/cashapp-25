
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

  useEffect(() => {
    const checkSessionAndRole = async () => {
      try {
        setIsCheckingAuth(true);
        
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erreur lors de la récupération de la session:", sessionError);
          toast.error("Erreur d'authentification: " + sessionError.message);
          navigate("/login", { replace: true });
          return;
        }
        
        if (!session) {
          console.log("Aucune session active, redirection vers la page de connexion");
          navigate("/login", { replace: true });
          return;
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Erreur lors de la récupération du profil:", profileError);
          toast.error("Erreur lors de la vérification des permissions: " + profileError.message);
          
          // If profile doesn't exist but user is authenticated, they might need to create a profile
          if (profileError.code === 'PGRST116') {
            toast.error("Profil utilisateur non trouvé. Veuillez contacter un administrateur.");
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
        toast.error("Une erreur est survenue: " + (error.message || "Vérifiez votre connexion internet"));
        navigate("/login", { replace: true });
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/login", { replace: true });
      } else if (event === "SIGNED_IN") {
        checkSessionAndRole();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return { userRole, isCheckingAuth };
};
