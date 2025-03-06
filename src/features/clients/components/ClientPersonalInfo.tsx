
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "../types";
import { ClientQRCode } from "./ClientQRCode";
import { RefObject } from "react";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ClientIdBadge } from "./ClientIdBadge";

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
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Informations personnelles
            {clientId && <ClientIdBadge clientId={clientId} />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PersonalInfoFields 
            client={client} 
            formatAmount={formatAmount} 
            showBalance={true}
          />
        </CardContent>
      </Card>
      
      {clientId && qrCodeRef && (
        <div ref={qrCodeRef} className="md:col-span-1">
          <ClientQRCode
            clientId={clientId}
            clientName={`${client.prenom} ${client.nom}`}
            size={180}
          />
        </div>
      )}
    </div>
  );
};
