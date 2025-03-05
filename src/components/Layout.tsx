
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "./layout/Navbar";
import { useAuthCheck } from "./layout/useAuthCheck";
import { useLogout } from "./layout/useLogout";
import { Loader2 } from "lucide-react";

const Layout = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { userRole, isCheckingAuth } = useAuthCheck();
  const { handleLogout } = useLogout();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

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
