
import { Shield } from "lucide-react";
import { SystemUser, UserRole } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersList } from "@/features/admin/components/UsersList";
import { UserFilters } from "@/features/admin/components/UserFilters";

interface UsersSectionProps {
  users: SystemUser[];
  currentUser: SystemUser;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedRole: UserRole | "all";
  onRoleChange: (value: UserRole | "all") => void;
  onToggleStatus: (userId: string) => void;
  onUpdateUser: (user: SystemUser & { password?: string }) => void;
  onUpdatePermissions: (userId: string, permissions: SystemUser["permissions"]) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersSection = ({
  users,
  currentUser,
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedRole,
  onRoleChange,
  onToggleStatus,
  onUpdateUser,
  onUpdatePermissions,
  onDeleteUser
}: UsersSectionProps) => {
  const filteredUsers = users.filter(
    (user) =>
      (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDepartment === "all" ||
        user.department === selectedDepartment) &&
      (selectedRole === "all" || user.role === selectedRole)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gestion des utilisateurs
          </CardTitle>
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={onDepartmentChange}
            selectedRole={selectedRole}
            onRoleChange={onRoleChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <UsersList 
          users={filteredUsers} 
          currentUser={currentUser}
          onToggleStatus={onToggleStatus}
          onUpdateUser={onUpdateUser}
          onUpdatePermissions={onUpdatePermissions}
          onDeleteUser={onDeleteUser}
        />
      </CardContent>
    </Card>
  );
};
