
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
  
  return (
    <div className="space-y-6 w-full max-w-md mx-auto md:mx-0 animate-fadeIn">
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-sm transition-all hover:shadow-md">
          <div className="p-2 bg-primary/10 rounded-full">
            <User className="h-5 w-5 text-primary flex-shrink-0" />
          </div>
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-1">Nom complet</p>
            <p className="font-medium text-xl">
              {client.prenom} {client.nom}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-sm transition-all hover:shadow-md">
          <div className="p-2 bg-primary/10 rounded-full">
            <Phone className="h-5 w-5 text-primary flex-shrink-0" />
          </div>
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
            <p className="font-medium">{client.telephone}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 w-full">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-sm transition-all hover:shadow-md">
          <div className="p-2 bg-primary/10 rounded-full">
            <Mail className="h-5 w-5 text-primary flex-shrink-0" />
          </div>
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-1">Email</p>
            <p className="font-medium overflow-hidden text-ellipsis">
              {client.email || "Non renseigné"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-sm transition-all hover:shadow-md">
          <div className="p-2 bg-primary/10 rounded-full">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
          </div>
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-1">Date de création</p>
            <p className="font-medium">
              {format(new Date(client.date_creation || ""), "dd/MM/yyyy")}
            </p>
          </div>
        </div>
        
        {showBalance && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-sm transition-all hover:shadow-md">
            <div className="p-2 bg-primary/10 rounded-full">
              <Wallet className="h-5 w-5 text-primary flex-shrink-0" />
            </div>
            <div className="w-full">
              <p className="text-sm text-muted-foreground mb-1">Solde</p>
              <p className={cn(
                "font-medium text-lg",
                effectiveBalance >= 0 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                {formatAmount(effectiveBalance)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
