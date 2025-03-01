
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Client } from "../types";

interface PublicClientBalanceCardProps {
  client: Client;
}

export const PublicClientBalanceCard = ({ client }: PublicClientBalanceCardProps) => {
  return (
    <Card className="relative overflow-hidden backdrop-blur-xl bg-white/50 dark:bg-gray-950/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
      <CardHeader>
        <CardTitle className="text-2xl">Solde actuel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-4xl font-bold",
          client.solde >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {client.solde.toLocaleString()} €
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Mis à jour le {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </p>
      </CardContent>
    </Card>
  );
};
