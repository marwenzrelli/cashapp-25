
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserRole } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthCheck = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const checkSessionAndRole = async () => {
      try {
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erreur de session:", sessionError);
          toast.error("Erreur lors de la vérification de la session");
          navigate("/login", { replace: true });
          return;
        }

        if (!session) {
          console.log("Pas de session active");
          navigate("/login", { replace: true });
          return;
        }

        // Then get the profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Erreur lors de la récupération du profil:", profileError);
          toast.error("Erreur lors de la vérification des permissions", {
            description: "Impossible de récupérer votre profil"
          });
          return;
        }

        if (!profile) {
          console.error("Aucun profil trouvé pour l'utilisateur");
          toast.error("Erreur lors de la vérification des permissions", {
            description: "Profil utilisateur introuvable"
          });
          return;
        }

        // Set the role in state
        setUserRole(profile.role as UserRole);
        
        // Check route permissions
        const restrictedRoutes = {
          '/administration': ['supervisor'],
          '/statistics': ['supervisor', 'manager']
        };

        const currentPath = location.pathname;
        const allowedRoles = restrictedRoutes[currentPath as keyof typeof restrictedRoutes];

        if (allowedRoles && !allowedRoles.includes(profile.role)) {
          toast.error("Accès non autorisé", {
            description: "Vous n'avez pas les permissions nécessaires"
          });
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Erreur générale lors de la vérification:", error);
        toast.error("Erreur lors de la vérification des permissions");
      }
    };

    checkSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/login", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return { userRole };
};
