
import { useState } from "react";
import { AdminHeader } from "@/features/admin/components/administration/AdminHeader";
import { StatsSection } from "@/features/admin/components/administration/StatsSection";
import { UsersSection } from "@/features/admin/components/administration/UsersSection";
import { AuditLogSection } from "@/features/admin/components/administration/AuditLogSection";
import { AddUserDialog } from "@/features/admin/components/AddUserDialog";
import { UserProfile } from "@/features/admin/components/UserProfile";
import { ServiceExplanations } from "@/features/admin/components/ServiceExplanations";
import { SystemUser, UserRole } from "@/types/admin";

interface AdminDashboardProps {
  users: SystemUser[];
  currentUser: SystemUser;
  toggleUserStatus: (userId: string) => void;
  updateUser: (user: SystemUser & { password?: string }) => void;
  updatePermissions: (userId: string, permissions: SystemUser["permissions"]) => void;
  deleteUser: (userId: string) => void;
  addUser: (user: SystemUser & { password: string }) => void;
}

export const AdminDashboard = ({
  users,
  currentUser,
  toggleUserStatus,
  updateUser,
  updatePermissions,
  deleteUser,
  addUser
}: AdminDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");

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
