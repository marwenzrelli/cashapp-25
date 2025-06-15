
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/admin";
import { toast } from "sonner";

export const useAuthCheck = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("Aucune session active, redirection vers login");
          navigate("/login");
          return;
        }

        console.log("Session active pour l'utilisateur:", session.user.id);
        console.log("Email de l'utilisateur:", session.user.email);

        // Vérifier d'abord si c'est un superviseur par email
        const supervisorEmails = [
          'marwen.zrelli.pro@icloud.com',
          'marwen.zrelli@gmail.com'
        ];

        if (session.user.email && supervisorEmails.includes(session.user.email.toLowerCase())) {
          console.log("Email de superviseur reconnu directement:", session.user.email);
          setUserRole('supervisor');
          return;
        }

        // Sinon, vérifier dans la base de données
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, email, full_name')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Erreur lors de la récupération du profil:", profileError);
          
          // Si le profil n'existe pas, créer un profil superviseur pour les emails autorisés
          if (profileError.code === 'PGRST116' && session.user.email && supervisorEmails.includes(session.user.email.toLowerCase())) {
            console.log("Création d'un profil superviseur pour:", session.user.email);
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.email,
                role: 'supervisor'
              });

            if (insertError) {
              console.error("Erreur lors de la création du profil:", insertError);
              setUserRole('supervisor'); // Forcer le rôle superviseur même si l'insertion échoue
            } else {
              console.log("Profil superviseur créé avec succès");
              setUserRole('supervisor');
            }
            return;
          }
          
          // Par défaut, donner les droits de superviseur aux emails autorisés
          if (session.user.email && supervisorEmails.includes(session.user.email.toLowerCase())) {
            setUserRole('supervisor');
            return;
          }
          
          setUserRole('cashier');
          return;
        }

        console.log("Profil trouvé:", profile);
        setUserRole(profile.role as UserRole);

      } catch (error) {
        console.error("Erreur lors de la vérification d'authentification:", error);
        toast.error("Erreur de connexion");
        navigate("/login");
      }
    };

    checkAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Changement d'état d'authentification:", event);
      
      if (event === 'SIGNED_OUT') {
        setUserRole(null);
        navigate("/login");
      } else if (event === 'SIGNED_IN' && session) {
        // Re-exécuter la logique de vérification du rôle
        setTimeout(() => {
          checkAuth();
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { userRole };
};
