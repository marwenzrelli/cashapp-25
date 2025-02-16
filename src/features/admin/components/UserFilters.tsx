
import { Search, Building, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/admin";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedRole: UserRole | "all";
  onRoleChange: (value: UserRole | "all") => void;
}

export const UserFilters = ({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedRole,
  onRoleChange,
}: UserFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={selectedDepartment}
        onValueChange={onDepartmentChange}
      >
        <SelectTrigger className="w-[180px]">
          <Building className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les services</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="operations">Opérations</SelectItem>
          <SelectItem value="accounting">Comptabilité</SelectItem>
        </SelectContent>
      </Select>
      <Select 
        value={selectedRole} 
        onValueChange={onRoleChange}
      >
        <SelectTrigger className="w-[180px]">
          <UserCog className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Rôle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les rôles</SelectItem>
          <SelectItem value="supervisor">Superviseur</SelectItem>
          <SelectItem value="manager">Gestionnaire</SelectItem>
          <SelectItem value="cashier">Caissier</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
