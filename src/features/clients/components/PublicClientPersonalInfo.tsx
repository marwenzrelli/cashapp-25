
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ClientIdBadge } from "./ClientIdBadge";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PersonalInfoFields } from "./PersonalInfoFields";

interface PublicClientPersonalInfoProps {
  client: Client;
}

export const PublicClientPersonalInfo = ({ client }: PublicClientPersonalInfoProps) => {
  const { currency } = useCurrency();
  
  return (
    <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 md:col-span-3 w-full sm:rounded-lg rounded-none sm:border border-x-0 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-gray-50/70 to-white/70 dark:from-gray-900/70 dark:to-gray-800/70 backdrop-blur-md">
        <CardTitle className="text-xl flex items-center justify-between text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-700 dark:from-primary dark:to-blue-500">
          Informations personnelles
          <ClientIdBadge clientId={client.id} />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-3 w-full">
          <div className="md:col-span-2 w-full">
            <PersonalInfoFields 
              client={client} 
              showBalance={false}
              showBalanceOnMobile={false}
            />
          </div>
          <div className="mt-0 w-full">
            <div className="flex items-start gap-3 w-full p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-sm transition-all hover:shadow-md">
              <div className="p-2 bg-primary/10 rounded-full">
                <Wallet className="h-6 w-6 text-primary mt-1" />
              </div>
              <div className="w-full">
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
