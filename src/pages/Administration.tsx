
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

const Administration = () => {
  useAuthenticationCheck();
  
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

  if (isLoading) {
    return <LoadingState />;
  }

  if (usersError || !currentUser) {
    return <ErrorState />;
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
