
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

export const useDepositAuth = (navigate: NavigateFunction) => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Vous devez être connecté pour accéder à cette page");
      navigate("/login");
      return false;
    }
    return true;
  };

  return { checkAuth };
};
