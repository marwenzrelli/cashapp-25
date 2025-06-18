
import React from "react";
import {
  Home,
  Users,
  Settings,
  Activity,
  CreditCard,
  ArrowRightLeft
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationLinksProps {
  onItemClick?: () => void;
}

export const NavigationLinks = ({ onItemClick }: NavigationLinksProps) => {
  const navigationItems = [
    {
      to: "/",
      icon: Home,
      label: "Tableau de Bord",
      count: null
    },
    {
      to: "/clients",
      icon: Users,
      label: "Clients",
      count: null
    },
    {
      to: "/operations-history",
      icon: Activity,
      label: "Historique des Opérations",
      count: null
    },
    {
      to: "/direct-operations",
      icon: ArrowRightLeft,
      label: "Opérations Directes",
      count: null
    },
    {
      to: "/statistics",
      icon: CreditCard,
      label: "Statistiques",
      count: null
    },
    {
      to: "/administration",
      icon: Settings,
      label: "Administration",
      count: null
    }
  ];

  return (
    <div className="flex md:flex-row flex-col md:space-x-4 space-y-1 md:space-y-0">
      {navigationItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "group flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-secondary hover:text-foreground transition-colors",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
          {item.count ? (
            <span className="ml-auto rounded-sm bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground">
              {item.count}
            </span>
          ) : null}
        </NavLink>
      ))}
    </div>
  );
};
