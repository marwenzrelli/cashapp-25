
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
} from "lucide-react";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/clients", label: "Clients", icon: Users },
    { path: "/deposits", label: "Versements", icon: ArrowDownCircle },
    { path: "/withdrawals", label: "Retraits", icon: ArrowUpCircle },
    { path: "/transfers", label: "Virements", icon: RefreshCcw },
    { path: "/statistics", label: "Statistiques", icon: BarChart },
    { path: "/operations", label: "Recherche", icon: Search },
    { path: "/administration", label: "Administration", icon: Shield },
  ];

  const handleLogout = () => {
    // TODO: Implement actual logout
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
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
              <div className="flex items-center space-x-4">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
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
            </div>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 px-4 py-2 transition-all duration-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
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
