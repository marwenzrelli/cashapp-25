
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "./layout/Navbar";
import { useAuthCheck } from "./layout/useAuthCheck";
import { useLogout } from "./layout/useLogout";

const Layout = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { userRole } = useAuthCheck();
  const { handleLogout } = useLogout();

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentPath={location.pathname}
        userRole={userRole}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
