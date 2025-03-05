
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        toast.error("Erreur lors de la vérification des permissions");
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
        toast.error("Accès non autorisé");
        navigate("/dashboard", { replace: true });
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
