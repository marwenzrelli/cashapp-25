
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Déconnexion de Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Supprimer tous les tokens stockés localement
      localStorage.removeItem('sb-jyqtmpbdicwofkhtvjyy-auth-token');
      
      // Nettoyer le localStorage pour s'assurer que toutes les données de session sont supprimées
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Redirection et notification
      navigate("/login", { replace: true });
      toast.success("Déconnexion réussie");
      
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      
      // Forcer la déconnexion même en cas d'erreur
      localStorage.clear();
      navigate("/login", { replace: true });
      toast.error("La session a été réinitialisée");
    }
  };

  return { handleLogout };
};
