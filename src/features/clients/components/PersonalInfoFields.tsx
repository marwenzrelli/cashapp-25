
import { User, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Client } from "../types";

interface PersonalInfoFieldsProps {
  client: Client;
  formatAmount?: (amount: number) => string;
  showBalanceOnMobile?: boolean;
  showBalance?: boolean;
}

export const PersonalInfoFields = ({ 
  client, 
  formatAmount = (amount) => `${amount.toLocaleString()} €`,
  showBalanceOnMobile = false,
  showBalance = false
}: PersonalInfoFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Nom complet</p>
            <p className="font-medium">
              {client.prenom} {client.nom}
            </p>
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
            <p className="font-medium">{client.email || "Non renseigné"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Date de création</p>
            <p className="font-medium">
              {format(new Date(client.date_creation || ""), "dd/MM/yyyy")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
