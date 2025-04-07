
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

export const NavigationLinks = () => {
  return (
    <div className="space-y-1">
      <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Tableau de bord" />
      <NavItem to="/clients" icon={<Users size={18} />} label="Clients" />
      <NavItem to="/deposits" icon={<ArrowDownToLine size={18} />} label="Versements" />
      <NavItem to="/withdrawals" icon={<ArrowUpFromLine size={18} />} label="Retraits" />
      <NavItem to="/transfers" icon={<ArrowLeftRight size={18} />} label="Virements" />
      <NavItem to="/statistics" icon={<BarChart2 size={18} />} label="Statistiques" />
      <NavItem to="/operations" icon={<ClipboardList size={18} />} label="Opérations" />
      <NavItem to="/search" icon={<Search size={18} />} label="Recherche" />
      <NavItem to="/administration" icon={<Settings size={18} />} label="Administration" />
    </div>
  );
};
