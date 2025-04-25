
import { User, Phone, Mail, Calendar, Wallet, BadgeCheck } from "lucide-react";
import { format } from "date-fns";
import { Client } from "../types";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PersonalInfoFieldsProps {
  client: Client;
  formatAmount?: (amount: number) => string;
  showBalanceOnMobile?: boolean;
  showBalance?: boolean;
  realTimeBalance?: number | null;
}

export const PersonalInfoFields = ({
  client,
  formatAmount,
  showBalanceOnMobile = false,
  showBalance = true,
  realTimeBalance = null
}: PersonalInfoFieldsProps) => {
  // Use the currency context for formatting
  const { formatCurrency } = useCurrency();
  
  // Use provided formatAmount function or fall back to currency context formatter
  const formatDisplayAmount = formatAmount || formatCurrency;
  
  // Use real-time balance if available, otherwise fall back to client.solde
  const effectiveBalance = realTimeBalance !== null ? realTimeBalance : client.solde;
  
  console.log("PersonalInfoFields displaying balance:", {
    realTimeBalance,
    clientSolde: client.solde,
    effectiveBalance
  });
  
  return (
    <div className="w-full space-y-6 rounded-lg">
      {/* Client primary info with gradient card */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5 shadow-sm w-full">
        <div className="flex items-center gap-4 mb-4 w-full">
          <div className="bg-primary/10 p-3 rounded-full">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="w-full">
            <h3 className="text-xl font-semibold tracking-tight">
              {client.prenom} {client.nom}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-primary/70" />
              Client vérifié
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex items-center gap-3 w-full">
            <Phone className="h-5 w-5 text-primary" />
            <div className="w-full">
              <p className="text-xs text-muted-foreground">Téléphone</p>
              <p className="font-medium w-full">{client.telephone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full">
            <Mail className="h-5 w-5 text-primary" />
            <div className="w-full">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium w-full overflow-hidden text-ellipsis">
                {client.email || "Non renseigné"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Secondary info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
          <div className="flex items-center gap-3 w-full">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="w-full">
              <p className="text-xs text-muted-foreground">Date de création</p>
              <p className="font-medium">
                {format(new Date(client.date_creation || ""), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        </div>
        
        {showBalance && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
            <div className="flex items-center gap-3 w-full">
              <div className="bg-primary/10 p-2 rounded-full">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="w-full">
                <p className="text-xs text-muted-foreground">Solde</p>
                <span className={cn(
                  "font-medium px-3 py-1.5 mt-1 inline-block border rounded-md w-full", 
                  effectiveBalance >= 0 
                    ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/20" 
                    : "text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20"
                )}>
                  {formatDisplayAmount(effectiveBalance)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
