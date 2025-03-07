
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, RefreshCw } from "lucide-react";

interface SupervisorPromotionFormProps {
  email: string;
  setEmail: (email: string) => void;
  isMakingSupervisor: boolean;
  onPromote: (email: string) => void;
  onCancel: () => void;
}

export const SupervisorPromotionForm = ({
  email,
  setEmail,
  isMakingSupervisor,
  onPromote,
  onCancel
}: SupervisorPromotionFormProps) => {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Shield className="h-5 w-5" />
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
              onClick={() => onPromote(email)}
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
                  <Shield className="h-4 w-4" />
                  Obtenir le rôle superviseur
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
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
  );
};
