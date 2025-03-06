
import { useState } from "react";
import { AddUserDialog } from "@/features/admin/components/AddUserDialog";
import { UserProfile } from "@/features/admin/components/UserProfile";
import { ServiceExplanations } from "@/features/admin/components/ServiceExplanations";
import { useUsers } from "@/features/admin/hooks/useUsers";
import { UserRole } from "@/types/admin";
import { AdminHeader } from "@/features/admin/components/administration/AdminHeader";
import { StatsSection } from "@/features/admin/components/administration/StatsSection";
import { UsersSection } from "@/features/admin/components/administration/UsersSection";
import { AuditLogSection } from "@/features/admin/components/administration/AuditLogSection";
import { AccessDenied } from "@/features/admin/components/administration/AccessDenied";
import { LoadingState } from "@/features/admin/components/administration/LoadingState";
import { ErrorState } from "@/features/admin/components/administration/ErrorState";
import { useAuthenticationCheck } from "@/features/admin/hooks/useAuthenticationCheck";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Administration = () => {
  useAuthenticationCheck();
  const navigate = useNavigate();
  
  const { 
    users, 
    currentUser, 
    isLoading, 
    error: usersError,
    isRetrying,
    retryLoading,
    toggleUserStatus,
    addUser,
    updateUser,
    updatePermissions,
    deleteUser,
    retryInitialization
  } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");

  if (isLoading) {
    return <LoadingState />;
  }

  // Check for RLS policy violation errors
  if (usersError && usersError.message?.includes("violates row-level security policy")) {
    return (
      <ErrorState errorMessage={usersError.message}>
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder ou modifier les profils utilisateurs.
            Cette fonctionnalité est réservée aux administrateurs de la plateforme.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
            <Button 
              onClick={() => navigate("/dashboard")} 
              variant="default"
              className="flex items-center gap-2"
            >
              Retourner au tableau de bord
            </Button>
          </div>
        </div>
      </ErrorState>
    );
  }

  // Check for errors that mention "not_admin" or "User not allowed"
  if (usersError && 
      (usersError.message?.includes("not_admin") || 
       usersError.message?.includes("User not allowed"))) {
    return (
      <ErrorState>
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions d'administrateur nécessaires pour accéder à cette page.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
            <Button 
              onClick={() => navigate("/dashboard")} 
              variant="default"
              className="flex items-center gap-2"
            >
              Retourner au tableau de bord
            </Button>
          </div>
        </div>
      </ErrorState>
    );
  }

  // Improved error handling for other errors
  if (usersError) {
    return (
      <ErrorState>
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            {usersError.message || "Une erreur s'est produite lors du chargement des données"}
          </p>
          <Button 
            onClick={retryInitialization} 
            variant="outline"
            className="flex items-center gap-2"
            disabled={isRetrying}
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Chargement en cours...' : 'Réessayer'}
          </Button>
        </div>
      </ErrorState>
    );
  }

  // Check for missing current user info
  if (!currentUser) {
    return (
      <ErrorState>
        <div className="mt-4 space-y-4">
          <p className="text-muted-foreground">
            Impossible de charger les informations de votre profil.
            Veuillez vous reconnecter ou contactez l'administrateur.
          </p>
          <Button 
            onClick={retryInitialization} 
            variant="outline"
            className="flex items-center gap-2"
            disabled={isRetrying}
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Chargement en cours...' : 'Réessayer'}
          </Button>
        </div>
      </ErrorState>
    );
  }

  if (currentUser.role !== 'supervisor') {
    return <AccessDenied message="Cette section est réservée aux superviseurs." />;
  }

  return (
    <div className="space-y-8 animate-in">
      <AdminHeader onAddUser={() => setIsAddUserOpen(true)} />
      
      <StatsSection users={users} />
      
      <UsersSection 
        users={users}
        currentUser={currentUser}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onToggleStatus={toggleUserStatus}
        onUpdateUser={updateUser}
        onUpdatePermissions={updatePermissions}
        onDeleteUser={deleteUser}
      />
      
      <AuditLogSection />

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
