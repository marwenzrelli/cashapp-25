
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
    role: "cashier" as UserRole,
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
    if (!newUser.fullName || !newUser.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      toast.error("Veuillez entrer une adresse email valide");
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
    setNewUser({
      fullName: "",
      email: "",
      role: "cashier",
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
