
import { Outlet } from "react-router-dom";
import { Navbar } from "./layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { NotificationManager } from "./layout/NotificationManager";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NotificationManager />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;
