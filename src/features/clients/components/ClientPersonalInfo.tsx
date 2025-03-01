
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
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Informations personnelles
          {clientId && <ClientIdBadge clientId={clientId} />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <PersonalInfoFields client={client} formatAmount={formatAmount} />
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
