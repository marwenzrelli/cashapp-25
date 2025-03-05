
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('sb-tujomckfdircqiztmqxt-auth-token');
      navigate("/login", { replace: true });
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      navigate("/login", { replace: true });
      toast.error("La session a été réinitialisée");
    }
  };

  return { handleLogout };
};
