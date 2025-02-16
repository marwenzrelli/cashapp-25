
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SystemUser, UserRole } from "@/types/admin";
import { Building, Check, Shield, Users, UserCog } from "lucide-react";

interface UserProfileProps {
  user: SystemUser;
}

export const UserProfile = ({ user }: UserProfileProps) => {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "supervisor":
        return "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/20";
      case "manager":
        return "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/20";
      case "cashier":
        return "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/20";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "supervisor":
        return <Shield className="h-8 w-8 text-purple-600" />;
      case "manager":
        return <UserCog className="h-8 w-8 text-green-600" />;
      case "cashier":
        return <Users className="h-8 w-8 text-orange-600" />;
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Votre Rôle dans le Système</h2>
          <p className="text-muted-foreground">
            Aperçu de vos responsabilités et autorisations
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className={`group relative overflow-hidden bg-gradient-to-br ${getRoleColor(user.role)} hover:shadow-lg transition-all duration-300`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            {getRoleIcon(user.role)}
          </div>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {user.fullName}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
              <div className="mt-1">
                {getRoleIcon(user.role)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Badge 
                  variant="outline" 
                  className={`
                    ${user.role === "supervisor" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      user.role === "manager" ? "bg-green-50 text-green-700 border-green-200" :
                      "bg-orange-50 text-orange-700 border-orange-200"}
                    px-3 py-1 text-sm font-medium
                  `}
                >
                  {user.role === "supervisor" ? "Superviseur" :
                   user.role === "manager" ? "Gestionnaire" :
                   "Caissier"}
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Informations</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Service: {user.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Statut: Actif</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Autorisations</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Shield className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Versements", "Retraits", "Virements", "Clients"].map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
