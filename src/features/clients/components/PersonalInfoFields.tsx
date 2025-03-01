
import { Client } from "../types";
import { Mail, Phone, Calendar, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PersonalInfoFieldsProps {
  client: Client;
  formatAmount: (amount: number) => string;
}

export const PersonalInfoFields = ({ client, formatAmount }: PersonalInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Mail className="h-6 w-6 text-primary mt-1" />
        <div>
          <p className="text-sm text-muted-foreground">Nom complet</p>
          <p className="text-lg font-semibold">{client.prenom} {client.nom}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Phone className="h-6 w-6 text-primary mt-1" />
        <div>
          <p className="text-sm text-muted-foreground">Téléphone</p>
          <p className="text-lg">{client.telephone}</p>
        </div>
      </div>
      {client.email && (
        <div className="flex items-start gap-3">
          <Mail className="h-6 w-6 text-primary mt-1" />
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-lg">{client.email}</p>
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <Calendar className="h-6 w-6 text-primary mt-1" />
        <div>
          <p className="text-sm text-muted-foreground">Date de création</p>
          <p className="text-lg">{client.date_creation ? format(new Date(client.date_creation), 'dd/MM/yyyy') : 'Non disponible'}</p>
        </div>
      </div>
      <div className="md:hidden flex items-start gap-3">
        <Wallet className="h-6 w-6 text-primary mt-1" />
        <div>
          <p className="text-sm text-muted-foreground">Solde actuel</p>
          <p className={cn(
            "text-3xl font-bold",
            client.solde >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {formatAmount(client.solde)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Mis à jour le {format(new Date(), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
      </div>
    </div>
  );
};
