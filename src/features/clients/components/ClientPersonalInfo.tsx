
import { format } from "date-fns";
import { User, Phone, Mail, Calendar, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { ClientQRCode } from "./ClientQRCode";
import { cn } from "@/lib/utils";
import { RefObject } from "react";

interface ClientPersonalInfoProps {
  client: Client;
  clientId?: number;
  qrCodeRef?: RefObject<HTMLDivElement>;
  formatAmount?: (amount: number) => string;
}

export const ClientPersonalInfo = ({ 
  client, 
  clientId, 
  qrCodeRef,
  formatAmount = (amount) => `${amount.toLocaleString()} €`
}: ClientPersonalInfoProps) => {
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
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
                <p className="font-medium">{client.email}</p>
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
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Solde actuel</p>
                <p className={cn(
                  "font-medium text-xl",
                  client.solde >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {formatAmount(client.solde)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Mis à jour le {format(new Date(), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>
          </div>
          {clientId && qrCodeRef && (
            <div className="space-y-4" ref={qrCodeRef}>
              <ClientQRCode
                clientId={clientId}
                clientName={`${client.prenom} ${client.nom}`}
                size={180} 
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
