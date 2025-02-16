
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, Shield, Search, Building, UserCog } from "lucide-react";
import { SystemUser, UserRole } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { StatCard } from "@/features/admin/components/StatCard";
import { AddUserDialog } from "@/features/admin/components/AddUserDialog";
import { UsersList } from "@/features/admin/components/UsersList";
import { UserProfile } from "@/features/admin/components/UserProfile";
import { ServiceExplanations } from "@/features/admin/components/ServiceExplanations";

const USERS_STORAGE_KEY = 'admin_users';

const Administration = () => {
  const [users, setUsers] = useState<SystemUser[]>(() => {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");

  // Sauvegarder les utilisateurs dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const toggleUserStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "inactive" : "active" }
          : user
      )
    );
    toast.success("Statut de l'utilisateur mis à jour");
  };

  const handleAddUser = (user: SystemUser) => {
    setUsers([user, ...users]);
    toast.success("Utilisateur créé avec succès");
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDepartment === "all" ||
        user.department === selectedDepartment) &&
      (selectedRole === "all" || user.role === selectedRole)
  );

  const connectedUser: SystemUser = {
    id: "current-user",
    fullName: "Jean Dupont",
    email: "jean.dupont@example.com",
    role: "supervisor",
    status: "active",
    permissions: [],
    createdAt: new Date().toISOString(),
    department: "finance",
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">
            Gestion des utilisateurs et des autorisations
          </p>
        </div>
        <Button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Total Utilisateurs"
          value={users.length}
          icon={Users}
          iconColor="text-blue-600"
          gradientFrom="blue-50"
        />
        <StatCard
          title="Superviseurs"
          value={users.filter((u) => u.role === "supervisor").length}
          icon={Shield}
          iconColor="text-purple-600"
          gradientFrom="purple-50"
        />
        <StatCard
          title="Gestionnaires"
          value={users.filter((u) => u.role === "manager").length}
          icon={UserCog}
          iconColor="text-green-600"
          gradientFrom="green-50"
        />
        <StatCard
          title="Caissiers"
          value={users.filter((u) => u.role === "cashier").length}
          icon={Users}
          iconColor="text-orange-600"
          gradientFrom="orange-50"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Gestion des utilisateurs
            </CardTitle>
            <div className="flex flex-wrap gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
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
                onValueChange={(value: UserRole | "all") => setSelectedRole(value)}
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
          </div>
        </CardHeader>
        <CardContent>
          <UsersList users={filteredUsers} onToggleStatus={toggleUserStatus} />
        </CardContent>
      </Card>

      <AddUserDialog
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onAddUser={handleAddUser}
      />

      <UserProfile user={connectedUser} />
      
      <ServiceExplanations />
    </div>
  );
};

export default Administration;
