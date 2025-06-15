
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from 'lucide-react';
import { NotificationManager } from './NotificationManager';
import { LogoSection } from './LogoSection';

const NavigationLinks = () => (
  <div className="hidden md:flex space-x-4">
    <Link to="/clients" className="hover:text-gray-500">Clients</Link>
    <Link to="/deposits" className="hover:text-gray-500">Versements</Link>
    <Link to="/withdrawals" className="hover:text-gray-500">Retraits</Link>
    <Link to="/transfers" className="hover:text-gray-500">Transferts</Link>
    <Link to="/reports" className="hover:text-gray-500">Rapports</Link>
  </div>
);

const MobileMenu = () => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="hover:bg-gray-100 dark:hover:bg-gray-700">
          Menu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/clients">Clients</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/deposits">Versements</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/withdrawals">Retraits</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/transfers">Transferts</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/reports">Rapports</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LogoutButton = () => {
  const { signOut, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
            <AvatarFallback>{user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={handleSignOut} disabled={isLoggingOut}>
          <LogOut className="h-4 w-4 mr-2" />
          {isMobile ? "Se déconnecter" : "Déconnexion"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <LogoSection />
            <NavigationLinks />
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationManager />
            <MobileMenu />
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
