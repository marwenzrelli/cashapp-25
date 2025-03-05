
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
  className?: string;
}

export const LogoutButton = ({ onLogout, className = "" }: LogoutButtonProps) => {
  return (
    <Button
      variant="ghost"
      className={`flex items-center space-x-2 px-4 py-2 transition-all duration-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 ${className}`}
      onClick={onLogout}
    >
      <LogOut 
        className="h-5 w-5 transform transition-all duration-300 hover:scale-110 hover:rotate-12"
        style={{ color: "#EF4444" }}
      />
      <span>Déconnexion</span>
    </Button>
  );
};
