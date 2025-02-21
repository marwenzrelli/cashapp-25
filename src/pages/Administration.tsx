
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, Shield, UserCog } from "lucide-react";
import { SystemUser, UserRole } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/features/admin/components/StatCard";
import { AddUserDialog } from "@/features/admin/components/AddUserDialog";
import { UsersList } from "@/features/admin/components/UsersList";
import { UserProfile } from "@/features/admin/components/UserProfile";
import { ServiceExplanations } from "@/features/admin/components/ServiceExplanations";
import { UserFilters } from "@/features/admin/components/UserFilters";
import { useUsers } from "@/features/admin/hooks/useUsers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Administration = () => {
  const navigate = useNavigate();
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Chargement...</h2>
          <p className="text-muted-foreground">Veuillez patienter pendant le chargement des données.</p>
        </div>
      </div>
    );
  }

  if (usersError || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-background rounded-lg shadow-lg border">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Erreur</h2>
          <p className="text-muted-foreground mb-4">
            {usersError ? "Erreur lors du chargement des données" : "Erreur lors du chargement du profil"}
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="mt-4"
          >
            Retourner au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'supervisor') {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-background rounded-lg shadow-lg border">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground mb-4">
            Cette section est réservée aux superviseurs.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="mt-4"
          >
            Retourner au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

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
            onToggleStatus={toggleUserStatus}
            onUpdateUser={updateUser}
            onUpdatePermissions={updatePermissions}
            onDeleteUser={deleteUser}
          />
        </CardContent>
      </Card>

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
