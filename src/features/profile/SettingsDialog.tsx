
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Shield, Moon, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentSettings: {
    notifications: boolean;
    darkMode: boolean;
    twoFactor: boolean;
    language: string;
  };
}

export const SettingsDialog = ({
  isOpen,
  onOpenChange,
  currentSettings,
}: SettingsDialogProps) => {
  const [settings, setSettings] = useState(currentSettings);

  const handleSave = () => {
    toast.success("Paramètres enregistrés avec succès");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
          <DialogDescription>
            Personnalisez vos préférences d'utilisation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications sur l'activité du compte
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Authentification à deux facteurs</Label>
                <p className="text-sm text-muted-foreground">
                  Ajouter une couche de sécurité supplémentaire
                </p>
              </div>
            </div>
            <Switch
              checked={settings.twoFactor}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, twoFactor: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Mode sombre</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le thème sombre de l'interface
                </p>
              </div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, darkMode: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Langue</Label>
                <p className="text-sm text-muted-foreground">
                  Choisir la langue de l'interface
                </p>
              </div>
            </div>
            <select
              value={settings.language}
              onChange={(e) =>
                setSettings({ ...settings, language: e.target.value })
              }
              className="rounded-md border bg-transparent px-3 py-2"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
