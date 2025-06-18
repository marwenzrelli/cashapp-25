
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/admin";
import { LogoSection } from "./LogoSection";
import { NavigationLinks } from "./NavigationLinks";
import { MobileMenu } from "./MobileMenu";
import { LogoutButton } from "./LogoutButton";

interface NavbarProps {
  currentPath: string;
  userRole: UserRole | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleLogout: () => Promise<void>;
}

export const Navbar = ({ currentPath, userRole, isOpen, setIsOpen, handleLogout }: NavbarProps) => {
  return (
    <nav className="border-b bg-card w-full">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <LogoSection />

            {/* Menu desktop - Navigation principale */}
            <div className="hidden md:flex">
              <NavigationLinks />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Menu mobile - Bouton hamburger */}
            <div className="md:hidden">
              <MobileMenu 
                isOpen={isOpen} 
                setIsOpen={setIsOpen} 
                userRole={userRole} 
                currentPath={currentPath}
                handleLogout={handleLogout} 
              />
            </div>

            {/* Bouton déconnexion desktop */}
            <div className="hidden md:flex">
              <LogoutButton onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
