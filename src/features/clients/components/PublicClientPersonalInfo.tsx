
import { format } from "date-fns";
import { User, Phone, Mail, Calendar, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { cn } from "@/lib/utils";

interface PublicClientPersonalInfoProps {
  client: Client;
}

export const PublicClientPersonalInfo = ({ client }: PublicClientPersonalInfoProps) => {
  return (
    <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 md:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg">Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{client.prenom} {client.nom}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{client.telephone}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date de création</p>
                <p className="font-medium">{format(new Date(client.date_creation || ''), 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Solde actuel</p>
                <p className={cn(
                  "text-2xl font-bold",
                  client.solde >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {client.solde.toLocaleString()} €
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mis à jour le {format(new Date(), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
