
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SystemUser, Permission } from "@/types/admin";
import { toast } from "sonner";

interface PermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onUpdatePermissions: (userId: string, permissions: Permission[]) => void;
}

const availablePermissions: Permission[] = [
  { id: "1", name: "Gestion des versements", description: "Autoriser la gestion des versements", module: "deposits" },
  { id: "2", name: "Gestion des retraits", description: "Autoriser la gestion des retraits", module: "withdrawals" },
  { id: "3", name: "Gestion des virements", description: "Autoriser la gestion des virements", module: "transfers" },
  { id: "4", name: "Gestion des clients", description: "Autoriser la gestion des clients", module: "clients" },
  { id: "5", name: "Accès aux rapports", description: "Autoriser l'accès aux rapports", module: "reports" },
  { id: "6", name: "Configuration système", description: "Autoriser la configuration du système", module: "settings" },
];

export const PermissionsDialog = ({ isOpen, onClose, user, onUpdatePermissions }: PermissionsDialogProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    user?.permissions.map(p => p.id) || []
  );

  if (!user) return null;

  const handleSubmit = () => {
    const permissions = availablePermissions.filter(p => selectedPermissions.includes(p.id));
    onUpdatePermissions(user.id, permissions);
    onClose();
    toast.success("Permissions mises à jour avec succès");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gérer les permissions</DialogTitle>
          <DialogDescription>
            Définissez les permissions pour {user.fullName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {availablePermissions.map((permission) => (
            <div key={permission.id} className="flex items-center space-x-2">
              <Checkbox
                id={`permission-${permission.id}`}
                checked={selectedPermissions.includes(permission.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPermissions([...selectedPermissions, permission.id]);
                  } else {
                    setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                  }
                }}
              />
              <label
                htmlFor={`permission-${permission.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {permission.name}
              </label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Enregistrer les permissions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
