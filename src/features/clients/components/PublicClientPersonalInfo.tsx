
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
  
  const formatAmount = (amount: number) => `${amount.toLocaleString()} ${currency}`;
  
  return (
    <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 md:col-span-3">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          Informations personnelles
          <ClientIdBadge clientId={client.id} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <PersonalInfoFields client={client} formatAmount={formatAmount} />
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
