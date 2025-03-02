
import { useState } from "react";
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

const Dashboard = () => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { currency } = useCurrency();
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const { stats, isLoading, recentActivity, handleRefresh } = useDashboardData();

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
