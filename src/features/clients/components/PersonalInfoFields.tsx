
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
  
  return <div className="space-y-6 w-full">
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <div className="w-full">
            <p className="text-sm text-muted-foreground mx-0 px-0 my-0 py-0 text-left">Nom complet</p>
            <p className="font-medium mx-0 my-px text-xl text-left">
              {client.prenom} {client.nom}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary" />
          <div className="w-full">
            <p className="text-sm text-muted-foreground text-left">Téléphone</p>
            <p className="font-medium text-left">{client.telephone}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary" />
          <div className="w-full">
            <p className="text-sm text-muted-foreground text-left">Email</p>
            <p className="font-medium overflow-hidden text-ellipsis text-left">{client.email || "Non renseigné"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div className="w-full">
            <p className="text-sm text-muted-foreground text-left">Date de création</p>
            <p className="font-medium text-left">
              {format(new Date(client.date_creation || ""), "dd/MM/yyyy")}
            </p>
          </div>
        </div>
        
        {showBalance && <div className="flex items-start gap-3">
            <Wallet className="h-5 w-5 text-primary mt-1" />
            <div className="w-full">
              <p className="text-sm text-muted-foreground text-left mb-1">Solde</p>
              <div>
                <span className={cn(
                  "font-medium text-left px-2 py-1 inline-block border border-gray-200 rounded-md", 
                  effectiveBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {formatAmount(effectiveBalance)}
                </span>
              </div>
            </div>
          </div>}
      </div>
    </div>;
};
