
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "./layout/Navbar";
import { useAuthCheck } from "./layout/useAuthCheck";
import { useLogout } from "./layout/useLogout";
import { Loader2, WifiOff } from "lucide-react";
import { Button } from "./ui/button";

const Layout = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { userRole, isCheckingAuth, networkError } = useAuthCheck();
  const { handleLogout } = useLogout();

  // Handle loading state
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

  // Handle network error state
  if (networkError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6 border rounded-lg shadow-sm">
          <WifiOff className="h-12 w-12 text-destructive mb-2" />
          <h2 className="text-xl font-bold">Problème de connexion réseau</h2>
          <p className="text-muted-foreground mb-4">
            Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Réessayer
          </Button>
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
