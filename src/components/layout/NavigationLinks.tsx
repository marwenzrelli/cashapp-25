
import { Link } from "react-router-dom";
import { LayoutDashboard, Users, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, LineChart, Search, Shield, LucideIcon } from "lucide-react";
import { NavItem } from "./NavItem";
import { UserRole } from "@/types/admin";

interface NavigationLinksProps {
  className?: string;
  onClick?: () => void;
  onNavigate?: () => void;
  currentPath: string;
  userRole: UserRole | null;
}

interface NavItemType {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const NavigationLinks = ({ className = "", onClick = () => {}, onNavigate = () => {}, currentPath, userRole }: NavigationLinksProps) => {
  console.log("NavigationLinks - userRole:", userRole);
  console.log("NavigationLinks - userRole type:", typeof userRole);
  
  const navItems: NavItemType[] = [
    { path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/clients", label: "Clients", icon: Users },
    { path: "/deposits", label: "Versements", icon: ArrowDownCircle },
    { path: "/withdrawals", label: "Retraits", icon: ArrowUpCircle },
    { path: "/transfers", label: "Virements", icon: ArrowLeftRight },
    { path: "/operations", label: "Recherche", icon: Search },
    { path: "/statistics", label: "Statistiques", icon: LineChart, roles: ['supervisor', 'manager'] },
    { path: "/administration", label: "Administration", icon: Shield, roles: ['supervisor'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    console.log(`Checking item ${item.label}:`, {
      hasRoles: !!item.roles,
      itemRoles: item.roles,
      userRole: userRole,
      shouldShow: !item.roles || (userRole && item.roles.includes(userRole))
    });
    
    if (!item.roles) return true;
    if (!userRole) {
      console.log(`No userRole for ${item.label}, hiding`);
      return false;
    }
    const shouldShow = item.roles.includes(userRole);
    console.log(`${item.label} should show:`, shouldShow);
    return shouldShow;
  });

  console.log("Filtered nav items:", filteredNavItems.map(item => item.label));

  const handleItemClick = () => {
    onClick();
    onNavigate();
  };

  return (
    <div className={className}>
      {filteredNavItems.map((item) => (
        <NavItem
          key={item.path}
          path={item.path}
          label={item.label}
          icon={item.icon}
          currentPath={currentPath}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
};
