
import { NavItem } from "./NavItem";
import {
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  BarChart2,
  ClipboardList,
  Settings,
  Search
} from "lucide-react";
import { UserRole } from "@/types/admin";

interface NavigationLinksProps {
  className?: string;
  onClick?: () => void;
  currentPath?: string;
  userRole?: UserRole | null;
}

export const NavigationLinks = ({ className, onClick, currentPath, userRole }: NavigationLinksProps) => {
  return (
    <div className={className || "space-y-1"}>
      <NavItem 
        to="/dashboard" 
        icon={LayoutDashboard} 
        label="Tableau de bord" 
        currentPath={currentPath || ""} 
        onClick={onClick}
      />
      <NavItem 
        to="/clients" 
        icon={Users} 
        label="Clients" 
        currentPath={currentPath || ""} 
        onClick={onClick}
      />
      <NavItem 
        to="/deposits" 
        icon={ArrowDownToLine} 
        label="Versements" 
        currentPath={currentPath || ""} 
        onClick={onClick}
      />
      <NavItem 
        to="/withdrawals" 
        icon={ArrowUpFromLine} 
        label="Retraits" 
        currentPath={currentPath || ""} 
        onClick={onClick}
      />
      <NavItem 
        to="/transfers" 
        icon={ArrowLeftRight} 
        label="Virements" 
        currentPath={currentPath || ""} 
        onClick={onClick}
      />
      <NavItem 
        to="/statistics" 
        icon={BarChart2} 
        label="Statistiques" 
        currentPath={currentPath || ""} 
        onClick={onClick}
      />
      <NavItem 
        to="/operations" 
        icon={ClipboardList} 
        label="Opérations" 
        currentPath={currentPath || ""} 
        onClick={onClick}
      />
      <NavItem 
        to="/search" 
        icon={Search} 
        label="Recherche" 
        currentPath={currentPath || ""} 
        onClick={onClick}
      />
      <NavItem 
        to="/administration" 
        icon={Settings} 
        label="Administration" 
        currentPath={currentPath || ""} 
        onClick={onClick}
      />
    </div>
  );
};
