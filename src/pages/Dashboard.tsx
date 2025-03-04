
import { useEffect, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SystemUser } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { EditProfileDialog } from "@/features/profile/EditProfileDialog";
import { SettingsDialog } from "@/features/profile/SettingsDialog";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { StatsCardGrid } from "@/features/dashboard/components/StatsCardGrid";
import { TransactionTrends } from "@/features/dashboard/components/TransactionTrends";
import { AISuggestions } from "@/features/dashboard/components/AISuggestions";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivity";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { currency } = useCurrency();
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const { stats, isLoading, error, recentActivity, handleRefresh } = useDashboardData();
  
  useEffect(() => {
    console.log("Dashboard component mounted");
    
    // Check if the user is logged in
    const checkUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("User session check:", session ? "Logged in" : "Not logged in");
        
        if (!session) {
          toast.error("Veuillez vous connecter pour accéder à cette page");
          return;
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      }
    };
    
    checkUserSession();
    
    return () => {
      console.log("Dashboard component unmounted");
    };
  }, []);

  const handleUpdateProfile = async (updatedUser: Partial<SystemUser>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Session expirée, veuillez vous reconnecter");
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedUser.fullName,
          email: updatedUser.email,
          department: updatedUser.department,
          phone: updatedUser.phone
        })
        .eq('id', currentUser?.id);

      if (error) throw error;

      setCurrentUser(prev => prev ? { ...prev, ...updatedUser } : null);
      setIsEditProfileOpen(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error("Erreur lors de la mise à jour du profil", {
        description: error.message || "Une erreur est survenue"
      });
    }
  };

  // Afficher un loader pendant le chargement
  if (isLoading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement du tableau de bord...</p>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
        <p className="text-muted-foreground mb-4 text-center max-w-md">{error}</p>
        <Button onClick={handleRefresh} variant="default">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <DashboardHeader isLoading={isLoading} onRefresh={handleRefresh} />

      <StatsCardGrid stats={stats} currency={currency} />

      <div className="grid gap-6 md:grid-cols-2">
        <TransactionTrends data={stats.monthly_stats} currency={currency} />
        <AISuggestions stats={stats} />
      </div>

      <RecentActivityCard activities={recentActivity} currency={currency} />

      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        currentUser={{
          name: currentUser?.fullName || "",
          email: currentUser?.email || "",
          phone: currentUser?.phone || "",
          department: currentUser?.department || "",
          role: currentUser?.role === "supervisor" ? "Superviseur" : 
                currentUser?.role === "manager" ? "Gestionnaire" : "Caissier",
          joinDate: currentUser?.createdAt || "",
          employeeId: currentUser?.id || ""
        }}
        onSubmit={handleUpdateProfile}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        currentSettings={{
          notifications: false,
          darkMode: false,
          twoFactor: false,
          language: "fr"
        }}
      />
    </div>
  );
};

export default Dashboard;
