
import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "./layout/Navbar";
import { useAuthCheck } from "./layout/useAuthCheck";
import { useLogout } from "./layout/useLogout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Layout = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { userRole } = useAuthCheck();
  const { handleLogout } = useLogout();

  useEffect(() => {
    // Vérification initiale de l'état d'authentification
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Veuillez vous connecter pour accéder à cette section");
      } else {
        console.log("Utilisateur connecté dans Layout:", session.user.email);
      }
    };
    
    checkAuth();
  }, []);

  console.log("Layout - userRole:", userRole);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentPath={location.pathname}
        userRole={userRole}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
