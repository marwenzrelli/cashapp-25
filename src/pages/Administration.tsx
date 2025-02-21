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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { users, currentUser, isLoading, toggleUserStatus, addUser, updateUser, updatePermissions, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSupervisor = currentUser?.role === "supervisor";

  const filteredUsers = users.filter(
    (user) =>
      (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDepartment === "all" ||
        user.department === selectedDepartment) &&
      (selectedRole === "all" || user.role === selectedRole)
  );

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          if (mounted) {
            setIsCheckingAuth(false);
            setIsAuthenticated(false);
            navigate("/login");
          }
          return;
        }

        const { data: isSupervisor, error: supervisorError } = await supabase
          .rpc('is_supervisor', { user_id: session.user.id });

        if (supervisorError) {
          console.error("Erreur lors de la vérification du rôle:", supervisorError);
          if (mounted) {
            setIsCheckingAuth(false);
            setIsAuthenticated(false);
            setError("Erreur lors de la vérification des permissions");
            toast.error("Erreur lors de la vérification des permissions");
          }
          return;
        }

        if (!isSupervisor) {
          if (mounted) {
            setIsCheckingAuth(false);
            setIsAuthenticated(false);
            setError("Accès réservé aux superviseurs");
            toast.error("Accès réservé aux superviseurs");
            setTimeout(() => {
              navigate("/dashboard");
            }, 2000);
          }
          return;
        }

        if (mounted) {
          setError(null);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          setError("Une erreur est survenue lors de la vérification");
          toast.error("Une erreur est survenue lors de la vérification");
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          navigate("/login");
        }
      } else {
        await checkAuth();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Vérification des autorisations...</h2>
          <p className="text-muted-foreground">Veuillez patienter pendant la vérification de vos droits d'accès.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-background rounded-lg shadow-lg border">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirection vers le tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser || currentUser.role !== 'supervisor') {
    return null;
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
        {isSupervisor && (
          <Button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        )}
      </div>

      {isSupervisor && (
        <>
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
                  onRoleChange={(value: UserRole | "all") => setSelectedRole(value)}
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
        </>
      )}

      {isSupervisor && (
        <AddUserDialog
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onAddUser={addUser}
        />
      )}

      <UserProfile user={currentUser} />
      
      {isSupervisor && <ServiceExplanations />}
    </div>
  );
};

export default Administration;
