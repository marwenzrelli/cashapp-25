
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SystemUser, UserRole } from "@/types/admin";

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: SystemUser) => void;
}

export const AddUserDialog = ({ isOpen, onClose, onAddUser }: AddUserDialogProps) => {
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    login: "",
    role: "cashier" as UserRole,
    password: "",
    confirmPassword: "",
  });

  const getDepartmentByRole = (role: UserRole): string => {
    switch (role) {
      case "supervisor":
        return "finance";
      case "manager":
        return "operations";
      case "cashier":
        return "accounting";
      default:
        return "accounting";
    }
  };

  const handleSubmit = () => {
    if (newUser.password !== newUser.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (newUser.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    const user: SystemUser = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      department: getDepartmentByRole(newUser.role),
      status: "active",
      permissions: [],
      createdAt: new Date().toISOString(),
    };

    onAddUser(user);
    onClose();
    setNewUser({
      fullName: "",
      email: "",
      login: "",
      role: "cashier",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
          <DialogDescription>
            Créez un nouvel utilisateur et définissez ses autorisations
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="fullName">Nom complet</label>
            <Input
              id="fullName"
              value={newUser.fullName}
              onChange={(e) =>
                setNewUser({ ...newUser, fullName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="login">Login</label>
            <Input
              id="login"
              value={newUser.login}
              onChange={(e) =>
                setNewUser({ ...newUser, login: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password">Mot de passe</label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              placeholder="Minimum 8 caractères"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <Input
              id="confirmPassword"
              type="password"
              value={newUser.confirmPassword}
              onChange={(e) =>
                setNewUser({ ...newUser, confirmPassword: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label>Rôle</label>
            <Select
              value={newUser.role}
              onValueChange={(value: UserRole) =>
                setNewUser({ ...newUser, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervisor">Superviseur (Finance)</SelectItem>
                <SelectItem value="manager">Gestionnaire (Opérations)</SelectItem>
                <SelectItem value="cashier">Caissier (Comptabilité)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Créer l'utilisateur</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
