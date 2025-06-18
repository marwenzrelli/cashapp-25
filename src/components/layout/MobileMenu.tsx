
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { NavigationLinks } from "./NavigationLinks";
import { UserRole } from "@/types/admin";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userRole: UserRole | null;
  currentPath: string;
  handleLogout: () => Promise<void>;
}

export const MobileMenu = ({ isOpen, setIsOpen, userRole, currentPath, handleLogout }: MobileMenuProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[100%] max-w-[300px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
            <span>Caisse</span>
          </SheetTitle>
        </SheetHeader>
        <NavigationLinks onItemClick={() => setIsOpen(false)} />
        <div className="absolute bottom-8 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 transition-all duration-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 text-red-500" />
            <span className="text-base">Déconnexion</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
