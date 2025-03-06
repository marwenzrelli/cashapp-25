
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
import { RefreshCw, ShieldAlert, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
    isMakingSupervisor,
    toggleUserStatus,
    addUser,
    updateUser,
    updatePermissions,
    deleteUser,
    retryInitialization,
    makeSelfSupervisor
  } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [email, setEmail] = useState("");
  const [showPromotionForm, setShowPromotionForm] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  const hasPermissionError = usersError && (
    usersError.message?.includes("violates row-level security policy") ||
    usersError.message?.includes("not_admin") ||
    usersError.message?.includes("User not allowed")
  );

  if (hasPermissionError) {
    return (
      <ErrorState 
        permissionError={true} 
        errorMessage={usersError?.message}
      >
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder ou modifier les profils utilisateurs.
            Cette fonctionnalité est réservée aux administrateurs de la plateforme.
          </p>
          
          {!showPromotionForm ? (
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
              <Button 
                onClick={() => navigate("/dashboard")} 
                variant="default"
                className="flex items-center gap-2"
              >
                Retourner au tableau de bord
              </Button>
              <Button
                onClick={retryInitialization}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isRetrying}
              >
                <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Vérification...' : 'Vérifier les permissions'}
              </Button>
              <Button
                onClick={() => setShowPromotionForm(true)}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <KeyRound className="h-4 w-4" />
                Obtenir les droits d'accès
              </Button>
            </div>
          ) : (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-500 mb-2">
                    <ShieldAlert className="h-5 w-5" />
                    <h3 className="font-medium">Demande d'accès superviseur</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Votre email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entrez votre email pour obtenir le rôle superviseur"
                    />
                    <p className="text-xs text-muted-foreground">
                      L'email doit correspondre à votre compte utilisateur actuel
                    </p>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => makeSelfSupervisor(email)}
                      disabled={!email || isMakingSupervisor}
                      className="flex items-center gap-2"
                    >
                      {isMakingSupervisor ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Attribution en cours...
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4" />
                          Obtenir le rôle superviseur
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPromotionForm(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Après avoir obtenu le rôle superviseur, vous devrez actualiser la page pour accéder à l'interface d'administration.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ErrorState>
    );
  }

  if (usersError) {
    return (
      <ErrorState errorMessage={usersError.message}>
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

  if (!currentUser) {
    return (
      <ErrorState errorMessage="Profil utilisateur non disponible">
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
