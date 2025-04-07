
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  to: string;
  label: string;
  icon: LucideIcon;
  currentPath: string;
  onClick?: () => void;
}

export const NavItem = ({ to, label, icon: Icon, currentPath, onClick }: NavItemProps) => {
  const isActive = currentPath === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 ${
        isActive
          ? "bg-primary text-primary-foreground shadow-lg transform hover:scale-105 hover:-translate-y-1"
          : "hover:bg-accent hover:shadow-md hover:-translate-y-0.5 transform"
      }`}
    >
      <Icon 
        className={`h-5 w-5 transform transition-transform duration-300 ${
          isActive 
            ? "drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]"
            : "hover:drop-shadow-[0_0_2px_rgba(59,130,246,0.3)]"
        }`}
        style={{
          color: isActive
            ? "#FFFFFF"
            : to === "/dashboard" ? "#9b87f5"
            : to === "/clients" ? "#0EA5E9"
            : to === "/deposits" ? "#10B981"
            : to === "/withdrawals" ? "#EF4444"
            : to === "/transfers" ? "#8B5CF6"
            : to === "/statistics" ? "#F97316"
            : "#D946EF"
        }}
        strokeWidth={isActive ? 2.5 : 2}
      />
      <span className="font-medium">{label}</span>
    </Link>
  );
};
