
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/types/admin";
import { AddUserDialog } from "@/features/admin/components/AddUserDialog";
import { useUsers } from "@/features/admin/hooks/useUsers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SystemAuditLog } from "@/features/admin/components/SystemAuditLog";
import { useQueryClient } from "@tanstack/react-query";
import { AdminHeader } from "@/features/admin/components/AdminHeader";
import { AdminStats } from "@/features/admin/components/AdminStats";
import { AdminUserCard } from "@/features/admin/components/AdminUserCard";
import { AdminAuditLogHeader } from "@/features/admin/components/AdminAuditLogHeader";
import { AccessDenied } from "@/features/admin/components/AccessDenied";
import { LoadingState } from "@/features/admin/components/LoadingState";
import { UserProfile } from "@/features/admin/components/UserProfile";
import { ServiceExplanations } from "@/features/admin/components/ServiceExplanations";

const Administration = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    users, 
    currentUser, 
    isLoading, 
    error: usersError,
    toggleUserStatus,
    addUser,
    updateUser,
    updatePermissions,
    deleteUser
  } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");

  const filteredUsers = users.filter(
    (user) =>
      (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDepartment === "all" ||
        user.department === selectedDepartment) &&
      (selectedRole === "all" || user.role === selectedRole)
  );

  const refreshAuditLogs = () => {
    toast.info("Rafraîchissement des journaux d'activité en cours...");
    queryClient.invalidateQueries({ queryKey: ['deleted-operations'] });
    queryClient.invalidateQueries({ queryKey: ['recent-operations'] });
    
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: ['deleted-operations'] });
      queryClient.refetchQueries({ queryKey: ['recent-operations'] });
      toast.success("Journaux d'activité mis à jour");
    }, 500);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session, redirecting to login");
          toast.error("Veuillez vous connecter");
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Erreur lors de la vérification de l'authentification");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (usersError || !currentUser) {
    return (
      <AccessDenied message="Erreur lors du chargement des données" />
    );
  }

  if (currentUser.role !== 'supervisor') {
    return (
      <AccessDenied message="Cette section est réservée aux superviseurs." />
    );
  }

  return (
    <div className="space-y-8 animate-in">
      <AdminHeader onAddUser={() => setIsAddUserOpen(true)} />

      <AdminStats users={users} />

      <AdminUserCard
        users={users}
        filteredUsers={filteredUsers}
        currentUser={currentUser}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onToggleStatus={toggleUserStatus}
        onUpdateUser={updateUser}
        onUpdatePermissions={updatePermissions}
        onDeleteUser={deleteUser}
      />

      <AdminAuditLogHeader onRefreshLogs={refreshAuditLogs} />
      <SystemAuditLog />

      <AddUserDialog
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onAddUser={addUser}
      />

      <UserProfile user={currentUser} />
      
      <ServiceExplanations />
    </div>
  );
};

export default Administration;
