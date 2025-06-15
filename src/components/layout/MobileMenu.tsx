
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { UserRole } from "@/types/admin";
import { NavigationLinks } from "./NavigationLinks";
import { LogoutButton } from "./LogoutButton";
import { NotificationButton } from "@/components/notifications/NotificationButton";

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
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <div className="flex-1 py-4">
            <NavigationLinks 
              className="flex flex-col space-y-2" 
              currentPath={currentPath}
              userRole={userRole}
              onNavigate={() => setIsOpen(false)}
            />
          </div>
          
          {/* Actions */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Notifications</span>
              <NotificationButton />
            </div>
            <LogoutButton onLogout={handleLogout} className="w-full" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
