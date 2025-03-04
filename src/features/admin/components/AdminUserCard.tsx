
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { SystemUser, UserRole } from "@/types/admin";
import { UsersList } from "@/features/admin/components/UsersList";
import { UserFilters } from "@/features/admin/components/UserFilters";

interface AdminUserCardProps {
  users: SystemUser[];
  filteredUsers: SystemUser[];
  currentUser: SystemUser;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  selectedRole: UserRole | "all";
  setSelectedRole: (role: UserRole | "all") => void;
  onToggleStatus: (userId: string) => void;
  onUpdateUser: (updatedUser: SystemUser) => void;
  onUpdatePermissions: (userId: string, permissions: any[]) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminUserCard = ({
  filteredUsers,
  currentUser,
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  selectedRole,
  setSelectedRole,
  onToggleStatus,
  onUpdateUser,
  onUpdatePermissions,
  onDeleteUser
}: AdminUserCardProps) => {
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
            onSearchChange={setSearchTerm}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
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
