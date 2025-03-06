
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserRole } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Email spécifique pour le superviseur qui doit toujours avoir accès
const SUPERVISOR_EMAIL = "marwen.zrelli.pro@icloud.com";

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

        console.log("Session active pour l'utilisateur:", session.user.id);
        console.log("Email de l'utilisateur:", session.user.email);

        // Check if email matches the supervisor's email directly
        if (session.user.email === SUPERVISOR_EMAIL) {
          console.log("Email de superviseur reconnu directement:", SUPERVISOR_EMAIL);
          setUserRole("supervisor");
          
          // Ensure the profile in database is updated with supervisor role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (!profile || (profile && profile.role !== 'supervisor')) {
            console.log("Mise à jour ou création du profil avec le rôle de superviseur");
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                full_name: profile?.full_name || "Superviseur Principal",
                role: "supervisor",
                profile_role: "supervisor",
                department: "finance",
                status: "active"
              });
              
            if (upsertError) {
              console.error("Erreur lors de la mise à jour du profil:", upsertError);
            } else {
              console.log("Profil de superviseur mis à jour avec succès");
            }
          }
          
          return;
        }

        // Then get the profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, profile_role, email, full_name')
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
          console.error("Aucun profil trouvé pour l'utilisateur:", session.user.id);
          
          // If no profile, but email matches supervisor, create one automatically
          if (session.user.email === SUPERVISOR_EMAIL) {
            console.log("Création automatique d'un profil pour le superviseur");
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: "Superviseur Principal",
                role: "supervisor",
                profile_role: "supervisor",
                department: "finance",
                status: "active"
              });
              
            if (insertError) {
              console.error("Erreur lors de la création du profil:", insertError);
              toast.error("Erreur lors de la création du profil");
            } else {
              console.log("Profil de superviseur créé avec succès");
              setUserRole("supervisor");
            }
            return;
          }
          
          toast.error("Erreur lors de la vérification des permissions", {
            description: "Profil utilisateur introuvable"
          });
          return;
        }

        console.log("Profil récupéré:", profile);
        console.log("Rôle de l'utilisateur:", profile.role);
        console.log("Profile Role de l'utilisateur:", profile.profile_role);

        // Utiliser profile_role s'il est défini, sinon utiliser role
        const effectiveRole = profile.profile_role || profile.role;
        
        // Set the role in state
        setUserRole(effectiveRole as UserRole);
        
        // Check route permissions
        const restrictedRoutes = {
          '/administration': ['supervisor'],
          '/statistics': ['supervisor', 'manager'],
          '/admin-utility': ['supervisor'] // Ajout pour l'utilitaire d'administration
        };

        const currentPath = location.pathname;
        const allowedRoles = restrictedRoutes[currentPath as keyof typeof restrictedRoutes];

        if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
          console.error(`Accès non autorisé à ${currentPath} pour le rôle ${effectiveRole}`);
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
      } else if (event === "SIGNED_IN") {
        checkSessionAndRole();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return { userRole };
};
