
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SystemUser, Permission } from "@/types/admin";
import { Shield, UserCog, Users, Check, X, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { EditUserDialog } from "./EditUserDialog";
import { PermissionsDialog } from "./PermissionsDialog";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface UsersListProps {
  users: SystemUser[];
  currentUser: SystemUser | null;
  onToggleStatus: (userId: string) => void;
  onUpdateUser: (updatedUser: SystemUser) => void;
  onUpdatePermissions: (userId: string, permissions: Permission[]) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersList = ({ users, currentUser, onToggleStatus, onUpdateUser, onUpdatePermissions, onDeleteUser }: UsersListProps) => {
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleClosePermissionsDialog = () => {
    setIsPermissionsDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    if (selectedUser) {
      onDeleteUser(selectedUser.id);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return "Jamais connecté";
    return `Il y a ${formatDistanceToNow(new Date(lastLogin), { locale: fr })}`;
  };

  const formatEmployeeId = (id: string) => {
    // Prendre les 4 premiers caractères de l'ID
    return id.slice(0, 4).toUpperCase();
  };

  const isSupervisor = currentUser?.role === "supervisor";

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière Connexion</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                    <div className="text-xs text-muted-foreground">
                      ID: {formatEmployeeId(user.id)}
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
                {formatLastLogin(user.lastLogin)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-accent">
                      <UserCog className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <UserCog className="h-4 w-4" />
                      <span>Modifier l'utilisateur</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsPermissionsDialogOpen(true);
                      }}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Gérer les permissions</span>
                    </DropdownMenuItem>
                    {isSupervisor && user.id !== currentUser?.id && (
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer text-red-600"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Supprimer l'utilisateur</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        user={selectedUser}
        onUpdateUser={onUpdateUser}
      />

      <PermissionsDialog
        isOpen={isPermissionsDialogOpen}
        onClose={handleClosePermissionsDialog}
        user={selectedUser}
        onUpdatePermissions={onUpdatePermissions}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
