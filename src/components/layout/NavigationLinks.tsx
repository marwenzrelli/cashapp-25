
import React from "react";
import {
  Home,
  Users,
  Settings,
  Activity,
  CreditCard,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Search,
  LayoutDashboard
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

interface NavigationLinksProps {
  onItemClick?: () => void;
}

export const NavigationLinks = ({ onItemClick }: NavigationLinksProps) => {
  const location = useLocation();
  
  const navigationItems = [
    {
      to: "/",
      icon: LayoutDashboard,
      label: "Tableau de Bord",
      color: "#9b87f5",
      count: null
    },
    {
      to: "/clients",
      icon: Users,
      label: "Clients",
      color: "#0EA5E9",
      count: null
    },
    {
      to: "/deposits",
      icon: TrendingUp,
      label: "Versements", 
      color: "#10B981",
      count: null
    },
    {
      to: "/withdrawals",
      icon: TrendingDown,
      label: "Retraits",
      color: "#EF4444",
      count: null
    },
    {
      to: "/transfers",
      icon: ArrowRightLeft,
      label: "Virements",
      color: "#8B5CF6",
      count: null
    },
    {
      to: "/operations-history",
      icon: Activity,
      label: "Historique des Opérations",
      color: "#F97316",
      count: null
    },
    {
      to: "/direct-operations",
      icon: ArrowRightLeft,
      label: "Opérations Directes",
      color: "#8B5CF6",
      count: null
    },
    {
      to: "/statistics",
      icon: CreditCard,
      label: "Statistiques",
      color: "#F97316",
      count: null
    },
    {
      to: "/administration",
      icon: Settings,
      label: "Administration",
      color: "#D946EF",
      count: null
    }
  ];

  return (
    <div className="flex md:flex-row flex-col md:space-x-2 space-y-1 md:space-y-0">
      {navigationItems.map((item) => {
        // Special case for dashboard - map /dashboard to / for active state check
        const isActive = item.to === "/" 
          ? (location.pathname === "/" || location.pathname === "/dashboard")
          : location.pathname === item.to;
        
        return (
          <Link
            key={item.label}
            to={item.to}
            onClick={onItemClick}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 whitespace-nowrap ${
              isActive
                ? "bg-primary text-primary-foreground shadow-lg transform hover:scale-105 hover:-translate-y-1"
                : "hover:bg-accent hover:shadow-md hover:-translate-y-0.5 transform"
            }`}
          >
            <item.icon 
              className={`h-5 w-5 transform transition-transform duration-300 flex-shrink-0 ${
                isActive 
                  ? "drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]"
                  : "hover:drop-shadow-[0_0_2px_rgba(59,130,246,0.3)]"
              }`}
              style={{
                color: isActive ? "#FFFFFF" : item.color
              }}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="font-medium hidden md:inline lg:inline">{item.label}</span>
            <span className="font-medium md:hidden">{item.label}</span>
            {item.count ? (
              <span className="ml-auto rounded-sm bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground">
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
};
