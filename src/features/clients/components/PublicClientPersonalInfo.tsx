
import { format } from "date-fns";
import { User, Phone, Mail, Calendar, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PublicClientPersonalInfoProps {
  client: Client;
}

export const PublicClientPersonalInfo = ({ client }: PublicClientPersonalInfoProps) => {
  const { currency } = useCurrency();
  
  return (
    <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 md:col-span-3">
      <CardHeader>
        <CardTitle className="text-xl">Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="text-lg font-semibold">{client.prenom} {client.nom}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="text-lg font-semibold">{client.telephone}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{client.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date de création</p>
                <p className="text-lg font-semibold">{format(new Date(client.date_creation || ''), 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-start gap-3">
              <Wallet className="h-6 w-6 text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Solde actuel</p>
                <p className={cn(
                  "text-3xl font-bold",
                  client.solde >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {client.solde.toLocaleString()} {currency}
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
