
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SystemUser } from "@/types/admin";
import { Shield, UserCog, Users, Check, X } from "lucide-react";

interface UsersListProps {
  users: SystemUser[];
  onToggleStatus: (userId: string) => void;
}

export const UsersList = ({ users, onToggleStatus }: UsersListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Dernière Connexion</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <Users className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  user.role === "supervisor"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : user.role === "manager"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-orange-50 text-orange-700 border-orange-200"
                }
              >
                {user.role === "supervisor"
                  ? "Superviseur"
                  : user.role === "manager"
                  ? "Gestionnaire"
                  : "Caissier"}
              </Badge>
            </TableCell>
            <TableCell>{user.department}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Switch
                  checked={user.status === "active"}
                  onCheckedChange={() => onToggleStatus(user.id)}
                />
                <Badge
                  variant="outline"
                  className={
                    user.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {user.status === "active" ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  {user.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              {user.lastLogin ? user.lastLogin : "Jamais connecté"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <UserCog className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Shield className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
