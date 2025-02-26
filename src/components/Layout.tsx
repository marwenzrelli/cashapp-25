
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCcw,
  Users,
  LogOut,
  BarChart,
  Search,
  DollarSign,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { UserRole } from "@/types/admin";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const navItems = [
    { path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/clients", label: "Clients", icon: Users },
    { path: "/deposits", label: "Versements", icon: ArrowDownCircle },
    { path: "/withdrawals", label: "Retraits", icon: ArrowUpCircle },
    { path: "/transfers", label: "Virements", icon: RefreshCcw },
    { path: "/statistics", label: "Statistiques", icon: BarChart, roles: ['supervisor', 'manager'] },
    { path: "/operations", label: "Recherche", icon: Search },
    { path: "/administration", label: "Administration", icon: Shield, roles: ['supervisor'] },
  ];

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

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return userRole && item.roles.includes(userRole);
  });

  const NavigationLinks = ({ className = "", onClick = () => {} }) => (
    <div className={className}>
      {filteredNavItems.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          onClick={onClick}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 ${
            location.pathname === path
              ? "bg-primary text-primary-foreground shadow-lg transform hover:scale-105 hover:-translate-y-1"
              : "hover:bg-accent hover:shadow-md hover:-translate-y-0.5 transform"
          }`}
        >
          <Icon 
            className={`h-5 w-5 transform transition-transform duration-300 ${
              location.pathname === path 
                ? "drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]"
                : "hover:drop-shadow-[0_0_2px_rgba(59,130,246,0.3)]"
            }`}
            style={{
              color: location.pathname === path
                ? "#FFFFFF"
                : path === "/dashboard" ? "#9b87f5"
                : path === "/clients" ? "#0EA5E9"
                : path === "/deposits" ? "#10B981"
                : path === "/withdrawals" ? "#EF4444"
                : path === "/transfers" ? "#8B5CF6"
                : path === "/statistics" ? "#F97316"
                : "#D946EF"
            }}
            strokeWidth={location.pathname === path ? 2.5 : 2}
          />
          <span className="font-medium">{label}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] rounded-lg blur opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] p-2 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <DollarSign className="h-6 w-6 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#8B5CF6] text-transparent bg-clip-text">
                  Flow Cash Control
                </span>
              </div>

              {/* Menu desktop */}
              <div className="hidden md:flex items-center ml-8 space-x-4">
                <NavigationLinks className="flex items-center space-x-4" />
              </div>

              {/* Menu mobile */}
              <div className="md:hidden ml-4">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[80%] max-w-sm">
                    <SheetHeader className="mb-4">
                      <SheetTitle className="flex items-center space-x-2">
                        <DollarSign className="h-6 w-6 text-primary" />
                        <span>Flow Cash Control</span>
                      </SheetTitle>
                    </SheetHeader>
                    <NavigationLinks
                      className="flex flex-col space-y-2"
                      onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 transition-all duration-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5 text-red-500" />
                        <span>Déconnexion</span>
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Bouton déconnexion desktop */}
            <Button
              variant="ghost"
              className="hidden md:flex items-center space-x-2 px-4 py-2 transition-all duration-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
              onClick={handleLogout}
            >
              <LogOut 
                className="h-5 w-5 transform transition-all duration-300 hover:scale-110 hover:rotate-12"
                style={{ color: "#EF4444" }}
              />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
