
import { Link } from "react-router-dom";
import { LayoutDashboard, Users, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, LineChart, Search, Shield, LucideIcon } from "lucide-react";
import { NavItem } from "./NavItem";
import { UserRole } from "@/types/admin";

interface NavigationLinksProps {
  className?: string;
  onClick?: () => void;
  currentPath: string;
  userRole: UserRole | null;
}

interface NavItemType {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const NavigationLinks = ({ className = "", onClick = () => {}, currentPath, userRole }: NavigationLinksProps) => {
  const navItems: NavItemType[] = [
    { path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/clients", label: "Clients", icon: Users },
    { path: "/deposits", label: "Versements", icon: ArrowDownCircle },
    { path: "/withdrawals", label: "Retraits", icon: ArrowUpCircle },
    { path: "/transfers", label: "Virements", icon: ArrowLeftRight },
    { path: "/statistics", label: "Statistiques", icon: LineChart, roles: ['supervisor', 'manager'] },
    { path: "/operations", label: "Recherche", icon: Search },
    { path: "/administration", label: "Administration", icon: Shield, roles: ['supervisor'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return userRole && item.roles.includes(userRole);
  });

  return (
    <div className={className}>
      {filteredNavItems.map((item) => (
        <NavItem
          key={item.path}
          path={item.path}
          label={item.label}
          icon={item.icon}
          currentPath={currentPath}
          onClick={onClick}
        />
      ))}
    </div>
  );
};
