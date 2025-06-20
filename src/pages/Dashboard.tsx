
import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SystemUser } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditProfileDialog } from "@/features/profile/EditProfileDialog";
import { SettingsDialog } from "@/features/profile/SettingsDialog";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { StatsCardGrid } from "@/features/dashboard/components/StatsCardGrid";
import { OperationTypeCards } from "@/features/dashboard/components/OperationTypeCards";
import { TransactionTrends } from "@/features/dashboard/components/TransactionTrends";
import { AISuggestions } from "@/features/dashboard/components/AISuggestions";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivity";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { recalculateAllClientBalances } from "@/features/statistics/utils/balanceCalculator";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

const Dashboard = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { currency } = useCurrency();
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const { stats, isLoading, recentActivity, handleRefresh } = useDashboardData();
  const [isRecalculating, setIsRecalculating] = useState(false);

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

  return (
    <div className="space-y-8 animate-in w-full px-0 sm:px-0">
      <DashboardHeader isLoading={isLoading} onRefresh={handleRefresh} />

      <StatsCardGrid 
        stats={stats} 
        currency={currency}
        onRecalculate={handleRecalculateBalances}
        isRecalculating={isRecalculating}
      />

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Types d'opérations</h3>
        <OperationTypeCards stats={stats} currency={currency} />
      </div>

      <div className="grid gap-6 md:grid-cols-3 w-full">
        <div className="md:col-span-2">
          <TransactionTrends data={stats.monthly_stats} currency={currency} />
        </div>
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

      <ScrollToTop />
    </div>
  );
};

export default Dashboard;
