import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SystemUser } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditProfileDialog } from "@/features/profile/EditProfileDialog";
import { SettingsDialog } from "@/features/profile/SettingsDialog";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { StatsCardGrid } from "@/features/dashboard/components/StatsCardGrid";
import { TransactionTrends } from "@/features/dashboard/components/TransactionTrends";
import { AISuggestions } from "@/features/dashboard/components/AISuggestions";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivity";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { recalculateAllClientBalances } from "@/features/statistics/utils/balanceCalculator";

const Dashboard = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { currency } = useCurrency();
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const { stats, isLoading, recentActivity, handleRefresh, error } = useDashboardData();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number>(Date.now());

  useEffect(() => {
    console.log("=== DASHBOARD DEBUG INFO ===");
    console.log("Current URL:", window.location.href);
    console.log("Dashboard mounted at:", new Date().toISOString());
    console.log("Dashboard stats:", stats);
    console.log("Dashboard isLoading:", isLoading);
    console.log("Dashboard error:", error);
    console.log("Dashboard recentActivity count:", recentActivity?.length || 0);
    console.log("Loading duration:", Date.now() - loadingStartTime, "ms");
    
    // Check Supabase configuration
    console.log("Supabase URL:", "https://jyqtmpbdicwofkhtvjyy.supabase.co");
    console.log("Supabase Key configured:", "Yes");
    
    // Test auth state
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      console.log("Dashboard session check:", {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: sessionError
      });
    });
  }, [stats, isLoading, error, recentActivity, loadingStartTime]);

  useEffect(() => {
    if (isLoading) {
      setLoadingStartTime(Date.now());
    }
  }, [isLoading]);

  const handleUpdateProfile = async (updatedUser: Partial<SystemUser>) => {
    try {
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
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  const handleRecalculateBalances = async () => {
    setIsRecalculating(true);
    try {
      toast.info("Recalcul des soldes clients en cours...");
      const success = await recalculateAllClientBalances();
      
      if (success) {
        toast.success("Tous les soldes clients ont été recalculés avec succès");
        handleRefresh();
      } else {
        toast.error("Erreur lors du recalcul des soldes clients");
      }
    } catch (error) {
      console.error("Error recalculating balances:", error);
      toast.error("Erreur lors du recalcul des soldes clients");
    } finally {
      setIsRecalculating(false);
    }
  };

  // Show loading state with timeout
  if (isLoading) {
    const loadingDuration = Date.now() - loadingStartTime;
    console.log("Dashboard is loading... Duration:", loadingDuration, "ms");
    
    return (
      <div className="space-y-8 animate-in w-full px-0 sm:px-0">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement du tableau de bord...</p>
          <p className="text-sm text-muted-foreground mt-2">
            {loadingDuration > 5000 ? "Vérification de la connexion..." : ""}
          </p>
          {loadingDuration > 10000 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-yellow-600">
                Le chargement prend plus de temps que prévu
              </p>
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    console.log("Dashboard has error:", error);
    return (
      <div className="space-y-8 animate-in w-full px-0 sm:px-0">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Erreur lors du chargement: {error}</p>
          <div className="space-y-2">
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 mr-2"
            >
              Réessayer
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Recharger la page
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <p>URL: {window.location.href}</p>
            <p>Timestamp: {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log("Dashboard rendering with data");

  return (
    <div className="space-y-8 animate-in w-full px-0 sm:px-0">
      <DashboardHeader isLoading={isLoading} onRefresh={handleRefresh} />

      <StatsCardGrid 
        stats={stats} 
        currency={currency}
        onRecalculate={handleRecalculateBalances}
        isRecalculating={isRecalculating}
      />

      <div className="grid gap-6 md:grid-cols-2 w-full">
        <TransactionTrends data={stats.monthly_stats} currency={currency} />
        <AISuggestions stats={stats} />
      </div>

      <div className="space-y-2">
        <RecentActivityCard activities={recentActivity} currency={currency} />
      </div>

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
