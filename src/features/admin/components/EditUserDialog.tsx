
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SystemUser, UserRole } from "@/types/admin";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onUpdateUser: (updatedUser: SystemUser) => void;
}

export const EditUserDialog = ({ isOpen, onClose, user, onUpdateUser }: EditUserDialogProps) => {
  const [editedUser, setEditedUser] = useState<Partial<SystemUser> & { password?: string; currentPassword?: string }>(user || {});

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editedUser.password) {
      if (editedUser.password.length < 8) {
        toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères");
        return;
      }

      if (!editedUser.currentPassword) {
        toast.error("Veuillez saisir votre mot de passe actuel");
        return;
      }

      // Vérifier d'abord que le mot de passe actuel est correct
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: editedUser.currentPassword
      });

      if (signInError) {
        toast.error("Le mot de passe actuel est incorrect");
        return;
      }

      // Mettre à jour le mot de passe
      const { error: passwordError } = await supabase.auth.updateUser({
        password: editedUser.password
      });

      if (passwordError) {
        if (passwordError.message.includes("same_password")) {
          toast.error("Le nouveau mot de passe doit être différent de l'ancien");
        } else {
          toast.error("Erreur lors de la mise à jour du mot de passe");
        }
        return;
      }
    }

    const updatedUser = {
      ...user,
      ...editedUser,
      department: getDepartmentByRole(editedUser.role as UserRole || user.role),
    };
    
    // Supprimer les mots de passe de l'objet avant de l'envoyer à onUpdateUser
    delete (updatedUser as any).password;
    delete (updatedUser as any).currentPassword;
    
    onUpdateUser(updatedUser);
    setEditedUser(prev => ({ ...prev, password: '', currentPassword: '' }));
    toast.success("Utilisateur mis à jour avec succès");
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'utilisateur
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label>Nom complet</label>
            <Input
              value={editedUser.fullName || user.fullName}
              onChange={(e) =>
                setEditedUser({ ...editedUser, fullName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label>Nom d'utilisateur</label>
            <Input
              value={editedUser.username || user.username}
              onChange={(e) =>
                setEditedUser({ ...editedUser, username: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label>Email</label>
            <Input
              type="email"
              value={editedUser.email || user.email}
              onChange={(e) =>
                setEditedUser({ ...editedUser, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label>Mot de passe actuel</label>
            <Input
              type="password"
              placeholder="Entrez le mot de passe actuel"
              value={editedUser.currentPassword || ""}
              onChange={(e) =>
                setEditedUser({ ...editedUser, currentPassword: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label>Nouveau mot de passe</label>
            <Input
              type="password"
              placeholder="Laisser vide pour conserver l'ancien"
              value={editedUser.password || ""}
              onChange={(e) =>
                setEditedUser({ ...editedUser, password: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground">
              Minimum 8 caractères. Doit être différent du mot de passe actuel.
            </p>
          </div>
          <div className="space-y-2">
            <label>Rôle</label>
            <Select
              value={editedUser.role || user.role}
              onValueChange={(value: UserRole) =>
                setEditedUser({ ...editedUser, role: value })
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
          <Button onClick={handleSubmit}>Enregistrer les modifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
