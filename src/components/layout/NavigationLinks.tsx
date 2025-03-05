
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
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
    { path: "/dashboard", label: "Tableau de bord", icon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> },
    { path: "/clients", label: "Clients", icon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { path: "/deposits", label: "Versements", icon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="m8 12 4 4 4-4"/></svg> },
    { path: "/withdrawals", label: "Retraits", icon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16V8"/><path d="m8 12 4-4 4 4"/></svg> },
    { path: "/transfers", label: "Virements", icon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg> },
    { path: "/statistics", label: "Statistiques", icon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>, roles: ['supervisor', 'manager'] },
    { path: "/operations", label: "Recherche", icon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> },
    { path: "/administration", label: "Administration", icon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, roles: ['supervisor'] },
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
