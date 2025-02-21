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
  const { users, currentUser, isLoading: isLoadingUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedDepartment === "all" ||
        user.department === selectedDepartment) &&
      (selectedRole === "all" || user.role === selectedRole)
  );

  useEffect(() => {
    console.log("Effect running, currentUser:", currentUser);
    let mounted = true;

    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log("No session, redirecting to login");
          if (mounted) {
            setIsCheckingAuth(false);
            navigate("/login");
          }
          return;
        }

        if (!currentUser && !isLoadingUsers) {
          console.log("No current user data and not loading");
          if (mounted) {
            setError("Erreur lors du chargement du profil");
            toast.error("Erreur lors du chargement du profil");
            setIsCheckingAuth(false);
          }
          return;
        }

        if (currentUser && currentUser.role !== 'supervisor') {
          console.log("User is not supervisor:", currentUser.role);
          if (mounted) {
            setError("Accès réservé aux superviseurs");
            toast.error("Accès réservé aux superviseurs", {
              duration: 3000
            });
            setIsCheckingAuth(false);
            setTimeout(() => {
              if (mounted) navigate("/dashboard");
            }, 3000);
          }
          return;
        }

        if (currentUser && currentUser.role === 'supervisor') {
          console.log("User is supervisor, granting access");
          if (mounted) {
            setError(null);
            setIsCheckingAuth(false);
          }
        }
      } catch (error) {
        console.error("Error during access check:", error);
        if (mounted) {
          setError("Une erreur est survenue");
          toast.error("Une erreur est survenue");
          setIsCheckingAuth(false);
          setTimeout(() => {
            if (mounted) navigate("/dashboard");
          }, 3000);
        }
      }
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        if (mounted) {
          navigate("/login");
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, currentUser, isLoadingUsers]);

  console.log("Render state:", {
    isCheckingAuth,
    error,
    currentUser,
    isLoadingUsers
  });

  if (isCheckingAuth || isLoadingUsers) {
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

  if (!currentUser || currentUser.role !== 'supervisor') {
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
        {currentUser?.role === "supervisor" && (
          <Button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        )}
      </div>

      {currentUser?.role === "supervisor" && (
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
                onToggleStatus={() => {}}
                onUpdateUser={() => {}}
                onUpdatePermissions={() => {}}
                onDeleteUser={() => {}}
              />
            </CardContent>
          </Card>
        </>
      )}

      {currentUser?.role === "supervisor" && (
        <AddUserDialog
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onAddUser={() => {}}
        />
      )}

      <UserProfile user={currentUser} />
      
      {currentUser?.role === "supervisor" && <ServiceExplanations />}
    </div>
  );
};

export default Administration;
