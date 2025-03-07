import { User, Phone, Mail, Calendar, Wallet } from "lucide-react";
import { format } from "date-fns";
import { Client } from "../types";
import { cn } from "@/lib/utils";
interface PersonalInfoFieldsProps {
  client: Client;
  formatAmount?: (amount: number) => string;
  showBalanceOnMobile?: boolean;
  showBalance?: boolean;
  realTimeBalance?: number | null;
}
export const PersonalInfoFields = ({
  client,
  formatAmount = amount => `${amount.toLocaleString()} €`,
  showBalanceOnMobile = false,
  showBalance = true,
  realTimeBalance = null
}: PersonalInfoFieldsProps) => {
  // Use real-time balance if available, otherwise fall back to client.solde
  const effectiveBalance = realTimeBalance !== null ? realTimeBalance : client.solde;
  return <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground mx-0 px-0 my-0 py-0 text-left">Nom complet</p>
            <p className="font-medium mx-0 my-px text-xl text-left">
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
            <p className="text-sm text-muted-foreground text-left">Email</p>
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
        
        {showBalance && <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground text-left text-base font-normal">Solde</p>
              <p className={cn("font-medium", effectiveBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {formatAmount(effectiveBalance)}
              </p>
            </div>
          </div>}
      </div>
    </div>;
};